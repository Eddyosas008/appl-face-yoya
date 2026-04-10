import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { useThemeContext } from '@/lib/theme-provider';
import { StarField } from '@/components/star-field';

// Styles statiques pour les sous-composants (avant le composant principal)
const styles = {} as ReturnType<typeof makeStyles>;


// ── Types ────────────────────────────────────────────────────────────────────
type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// ── Bulle de message ─────────────────────────────────────────────────────────
function ChatBubble({
  message,
  index,
  isDark,
}: {
  message: LocalMessage;
  index: number;
  isDark: boolean;
}) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  // Couleurs dynamiques
  const GOLD        = isDark ? '#C8A96E' : '#8B6914';
  const GOLD_BORDER = isDark ? 'rgba(201,168,76,0.35)' : 'rgba(184,146,46,0.35)';
  const TEXT_USER   = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_AI     = isDark ? 'rgba(237,233,255,0.70)' : 'rgba(60,40,120,0.80)';
  const BUBBLE_USER_BG     = isDark ? 'rgba(201,168,76,0.18)' : 'rgba(184,146,46,0.14)';
  const BUBBLE_AI_BG       = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';
  const BUBBLE_AI_BORDER   = isDark ? 'rgba(180,168,220,0.30)' : 'rgba(120,100,180,0.25)';
  const AVATAR_BG          = isDark ? 'rgba(201,168,76,0.15)' : 'rgba(184,146,46,0.12)';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: Math.min(index * 30, 120),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: Math.min(index * 30, 120),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        isUser && styles.bubbleRowUser,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: AVATAR_BG, borderColor: GOLD_BORDER }]}>
          <Text style={[styles.aiAvatarEmoji, { color: GOLD }]}>✦</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: BUBBLE_USER_BG, borderColor: GOLD_BORDER }]
            : [styles.bubbleAI, { backgroundColor: BUBBLE_AI_BG, borderColor: BUBBLE_AI_BORDER }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isUser ? { color: TEXT_USER, fontWeight: '500' } : { color: TEXT_AI },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Indicateur de frappe ─────────────────────────────────────────────────────
function TypingIndicator({ isDark }: { isDark: boolean }) {
  const GOLD        = isDark ? '#C8A96E' : '#8B6914';
  const GOLD_BORDER = isDark ? 'rgba(201,168,76,0.35)' : 'rgba(184,146,46,0.35)';
  const AVATAR_BG   = isDark ? 'rgba(201,168,76,0.15)' : 'rgba(184,146,46,0.12)';
  const BUBBLE_AI_BG     = isDark ? '#2A2540' : 'rgba(255,255,255,0.70)';
  const BUBBLE_AI_BORDER = isDark ? 'rgba(180,168,220,0.30)' : 'rgba(120,100,180,0.25)';

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      ).start();
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.bubbleRow}>
      <View style={[styles.aiAvatar, { backgroundColor: AVATAR_BG, borderColor: GOLD_BORDER }]}>
        <Text style={[styles.aiAvatarEmoji, { color: GOLD }]}>✦</Text>
      </View>
      <View style={[styles.bubble, styles.typingBubble, { backgroundColor: BUBBLE_AI_BG, borderColor: BUBBLE_AI_BORDER, borderWidth: 1 }]}>
        <View style={styles.typingDots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: dot, backgroundColor: GOLD }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Écran principal ──────────────────────────────────────────────────────────
type QuickPrompt = { label: string; icon: string; color: string; message: string };

const QUICK_PROMPTS_EMOTIONS: QuickPrompt[] = [
  { label: 'Je me sens submergée', icon: '🌊', color: 'rgba(59,130,246,0.18)', message: 'Je me sens submergée en ce moment, j\'ai besoin d\'aide.' },
  { label: 'J\'ai besoin de réconfort', icon: '🤗', color: 'rgba(236,72,153,0.18)', message: 'J\'ai besoin de réconfort et de douceur.' },
  { label: 'Je suis épuisée', icon: '😮‍💨', color: 'rgba(245,158,11,0.18)', message: 'Je suis épuisée émotionnellement, comment me ressourcer ?' },
  { label: 'Je rumine trop', icon: '🌀', color: 'rgba(139,92,246,0.18)', message: 'Je n\'arrête pas de ruminer des pensées négatives.' },
];

const QUICK_PROMPTS_SOMMEIL: QuickPrompt[] = [
  { label: 'Je n\'arrive pas à dormir', icon: '🌙', color: 'rgba(30,58,95,0.25)', message: 'Je n\'arrive pas à m\'endormir ce soir, que faire ?' },
  { label: 'Méditation du soir', icon: '✨', color: 'rgba(200,169,110,0.18)', message: 'Propose-moi une méditation guidée pour m\'endormir.' },
  { label: 'Exercice de respiration', icon: '🫁', color: 'rgba(5,150,105,0.18)', message: 'Guide-moi dans un exercice de respiration pour me calmer.' },
  { label: 'Routine du soir', icon: '🕯️', color: 'rgba(124,45,18,0.20)', message: 'Aide-moi à créer une routine du soir apaisante.' },
];

function getContextualPrompts(): QuickPrompt[] {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 6) return QUICK_PROMPTS_SOMMEIL;
  return QUICK_PROMPTS_EMOTIONS;
}

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  // ── Palette dynamique ──────────────────────────────────────────────────────
  const GOLD        = isDark ? '#C8A96E' : '#8B6914';
  const GOLD_BORDER = isDark ? 'rgba(201,168,76,0.35)' : 'rgba(184,146,46,0.35)';
  const TEXT_MAIN   = isDark ? '#EDE8DC' : '#1C1410';
  const TEXT_MUTED  = isDark ? 'rgba(237,233,255,0.50)' : 'rgba(100,80,140,0.60)';
  const AVATAR_BG   = isDark ? 'rgba(201,168,76,0.20)' : 'rgba(184,146,46,0.15)';
  const AVATAR_HALO = isDark ? 'rgba(201,168,76,0.12)' : 'rgba(184,146,46,0.10)';
  const INPUT_BG    = isDark ? '#2A2540' : 'rgba(255,255,255,0.80)';
  const WRAP_BG     = isDark ? 'rgba(3,2,15,0.95)' : 'rgba(240,237,248,0.97)';
  const PROMPT_BG   = isDark ? '#2A2540' : 'rgba(255,255,255,0.65)';
  const PROMPT_BORDER = isDark ? 'rgba(180,168,220,0.30)' : 'rgba(120,100,180,0.25)';
  const SEND_ACTIVE = isDark ? '#C8A96E' : '#8B6914';
  const SEND_ICON_COLOR = isDark ? '#0D0B1A' : '#FAF7F2';
  const SEND_DISABLED_BG = isDark ? '#2A2540' : 'rgba(0,0,0,0.06)';

  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { data: historyData, isLoading: historyLoading } = trpc.chat.history.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const sendMutation = trpc.chat.send.useMutation();
  const clearMutation = trpc.chat.clear.useMutation({
    onSuccess: () => setLocalMessages([]),
  });

  useEffect(() => {
    if (historyData && historyData.length > 0) {
      setLocalMessages(
        historyData.map((m) => ({
          id: m.id.toString(),
          role: m.role,
          content: m.content,
        }))
      );
    } else if (!historyLoading && localMessages.length === 0) {
      setLocalMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Bonsoir ✦ Je suis Luna, votre guide SomnioPax. Je suis là pour vous écouter et vous accompagner. Comment vous sentez-vous en ce moment ?\n\n⚠️ Je suis un outil de soutien, pas un professionnel de santé. En cas de détresse sévère, consultez un spécialiste.",
      }]);
    }
  }, [historyData, historyLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    const trimmed = text.trim();
    setInput('');
    const tempId = Date.now().toString();
    setLocalMessages((prev) => [...prev, { id: tempId, role: 'user', content: trimmed }]);
    setIsTyping(true);
    try {
      if (isAuthenticated) {
        const result = await sendMutation.mutateAsync({ message: trimmed });
        setLocalMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: result.reply },
        ]);
      } else {
        await new Promise((r) => setTimeout(r, 1000));
        setLocalMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Pour accéder à l'assistante IA personnalisée, connectez-vous à votre compte. Je suis là pour vous ! ✦",
          },
        ]);
      }
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Je suis momentanément indisponible. Prenez une grande inspiration — vous n'êtes pas seule. ✦",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function confirmClear() {
    Alert.alert(
      'Effacer la conversation',
      "Souhaitez-vous effacer tout l'historique ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            if (isAuthenticated) clearMutation.mutate();
            else setLocalMessages([]);
          },
        },
      ]
    );
  }

  const showQuickPrompts = localMessages.length <= 1;
  const canSend = input.trim().length > 0 && !isTyping;

  return (
    <ScreenContainer
      edges={['top', 'left', 'right']}
      containerClassName={isDark ? 'bg-[#0D0B1A]' : 'bg-[#FAF7F2]'}
    >
      {/* Fond étoilé */}
      <StarField />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* ── En-tête ── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={22} color={TEXT_MAIN} />
          </Pressable>

          <View style={styles.headerCenter}>
            {/* Avatar IA avec halo doré */}
            <View style={styles.headerAvatarWrap}>
              <View style={[styles.headerAvatarHalo, { backgroundColor: AVATAR_HALO, borderColor: GOLD_BORDER }]} />
              <View style={[styles.headerAvatar, { backgroundColor: AVATAR_BG, borderColor: GOLD_BORDER }]}>
                <Text style={[styles.headerAvatarEmoji, { color: GOLD }]}>✦</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: TEXT_MAIN }]}>SomnioPax</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? '#4ADE80' : GOLD }]} />
                <Text style={[styles.statusText, { color: TEXT_MUTED }]}>
                  {isAuthenticated ? 'IA connectée' : 'Mode hors ligne'}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={confirmClear}
          >
            <IconSymbol name="trash" size={20} color={TEXT_MUTED} />
          </Pressable>
        </View>

        {/* Séparateur doré */}
        <View style={[styles.headerDivider, { backgroundColor: GOLD_BORDER }]} />

        {/* ── Chargement historique ── */}
        {historyLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={GOLD} />
            <Text style={[styles.loadingText, { color: TEXT_MUTED }]}>Chargement de l'historique…</Text>
          </View>
        )}

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ChatBubble message={item} index={index} isDark={isDark} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator isDark={isDark} /> : null}
        />

        {/* ── Suggestions rapides ── */}
        {showQuickPrompts && (
          <View style={styles.quickPromptsWrap}>
            <Text style={[styles.quickPromptsTitle, { color: TEXT_MUTED }]}>Par où commencer ?</Text>
            <FlatList
              horizontal
              data={getContextualPrompts()}
              keyExtractor={(item) => item.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsList}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.quickPrompt,
                    { backgroundColor: item.color, borderColor: PROMPT_BORDER, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => sendMessage(item.message)}
                >
                  <Text style={styles.quickPromptIcon}>{item.icon}</Text>
                  <Text style={[styles.quickPromptText, { color: TEXT_MAIN }]} numberOfLines={2}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── Zone de saisie ── */}
        <View style={[styles.inputWrap, { backgroundColor: WRAP_BG, borderTopColor: GOLD_BORDER }]}>
          <View style={[styles.inputContainer, { backgroundColor: INPUT_BG, borderColor: GOLD_BORDER }]}>
            <TextInput
              style={[styles.textInput, { color: TEXT_MAIN }]}
              placeholder="Exprimez-vous librement…"
              placeholderTextColor={TEXT_MUTED}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: canSend ? SEND_ACTIVE : SEND_DISABLED_BG, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => sendMessage(input)}
              disabled={!canSend}
            >
              {isTyping
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <IconSymbol name="paperplane.fill" size={17} color={canSend ? SEND_ICON_COLOR : TEXT_MUTED} />
              }
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ── Styles (layout uniquement) ───────────────────────────────────────────────
function makeStyles(isDark: boolean) {
  const CARD   = isDark ? '#2A2540' : '#FFFFFF';
  const CARD2  = isDark ? '#201C38' : '#F5F0E8';
  const TEXT1  = isDark ? '#F0EBE0' : '#1C1410';
  const TEXT2  = isDark ? 'rgba(240,235,224,0.65)' : 'rgba(60,40,20,0.65)';
  const TEXT3  = isDark ? 'rgba(240,235,224,0.70)' : 'rgba(60,40,20,0.70)';
  const GOLD_C = isDark ? '#C8A96E' : '#8B6914';
  const BORD   = isDark ? 'rgba(200,169,110,0.40)' : 'rgba(139,105,20,0.30)';
  const BORD2  = isDark ? 'rgba(200,169,110,0.30)' : 'rgba(139,105,20,0.20)';
  return StyleSheet.create({
  // En-tête
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarHalo: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerAvatarEmoji: { fontSize: 16 },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: { fontSize: 11, letterSpacing: 0.3 },
  headerDivider: {
    height: 0.5,
    marginHorizontal: 16,
  },

  // Chargement
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: { fontSize: 13 },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },

  // Avatar IA
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarEmoji: { fontSize: 14 },

  // Bulles
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleUser: {
    borderWidth: 1,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },

  // Indicateur de frappe
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Suggestions rapides
  quickPromptsWrap: { paddingVertical: 8 },
  quickPromptsTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickPromptsList: { paddingHorizontal: 16, gap: 10 },
  quickPrompt: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    maxWidth: 160,
    gap: 4,
    alignItems: 'flex-start',
  },
  quickPromptIcon: { fontSize: 20, marginBottom: 2 },
  quickPromptText: { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  // Zone de saisie
  inputWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  });
}
