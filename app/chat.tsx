import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import Svg, { Circle, Ellipse } from 'react-native-svg';

// ── Palette SomnioPax v3 ────────────────────────────────────────────────────
const NIGHT_BG    = '#03020F';
const GOLD        = '#C9A84C';
const GOLD_SOFT   = 'rgba(201,168,76,0.12)';
const GOLD_BORDER = 'rgba(201,168,76,0.35)';
const LAVENDER    = 'rgba(237,233,255,0.55)';
const LAV_BORDER  = 'rgba(180,168,220,0.30)';
const GLASS_BG    = 'rgba(255,255,255,0.04)';
const GLASS_USER  = 'rgba(201,168,76,0.18)';
const TEXT_MAIN   = '#EDE9FF';
const TEXT_MUTED  = 'rgba(237,233,255,0.50)';
const STAR_COLOR  = 'rgba(237,233,255,0.55)';

// ── Étoiles statiques ────────────────────────────────────────────────────────
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  cx: (i * 37 + 11) % 390,
  cy: (i * 53 + 7) % 700,
  r: i % 3 === 0 ? 1.4 : i % 5 === 0 ? 1.0 : 0.7,
}));

function StarField() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width="100%" height="100%">
        {STARS.map((s) => (
          <Circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill={STAR_COLOR} />
        ))}
        {/* Aurora blobs */}
        <Ellipse cx="80" cy="120" rx="140" ry="80" fill="rgba(88,28,135,0.12)" />
        <Ellipse cx="320" cy="250" rx="100" ry="60" fill="rgba(55,48,163,0.10)" />
        <Ellipse cx="180" cy="500" rx="120" ry="70" fill="rgba(88,28,135,0.08)" />
      </Svg>
    </View>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────
type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// ── Bulle de message ─────────────────────────────────────────────────────────
function ChatBubble({ message, index }: { message: LocalMessage; index: number }) {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

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
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarEmoji}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Indicateur de frappe ─────────────────────────────────────────────────────
function TypingIndicator() {
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
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarEmoji}>✦</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <View style={styles.typingDots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Écran principal ──────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Je me sens submergée',
  "Je n'arrive pas à dormir",
  'Je rumine trop',
  "J'ai besoin de réconfort",
  'Je suis épuisée émotionnellement',
];

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
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
        content: "Bonsoir ✦ Je suis Yoya, votre guide bien-être. Je suis là pour vous écouter et vous accompagner. Comment vous sentez-vous en ce moment ?\n\n⚠️ Je suis un outil de soutien, pas un professionnel de santé. En cas de détresse sévère, consultez un spécialiste.",
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
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-[#03020F]">
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
              <View style={styles.headerAvatarHalo} />
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarEmoji}>✦</Text>
              </View>
            </View>
            <View>
              <Text style={styles.headerTitle}>Yoya</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isAuthenticated ? '#4ADE80' : GOLD }]} />
                <Text style={styles.statusText}>
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
        <View style={styles.headerDivider} />

        {/* ── Chargement historique ── */}
        {historyLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={GOLD} />
            <Text style={styles.loadingText}>Chargement de l'historique…</Text>
          </View>
        )}

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ChatBubble message={item} index={index} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* ── Suggestions rapides ── */}
        {showQuickPrompts && (
          <View style={styles.quickPromptsWrap}>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsList}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.quickPrompt, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => sendMessage(item)}
                >
                  <Text style={styles.quickPromptText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ── Zone de saisie ── */}
        <View style={styles.inputWrap}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
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
                canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => sendMessage(input)}
              disabled={!canSend}
            >
              {isTyping
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <IconSymbol name="paperplane.fill" size={17} color={canSend ? NIGHT_BG : TEXT_MUTED} />
              }
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
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
    backgroundColor: GOLD_SOFT,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(201,168,76,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOLD_BORDER,
  },
  headerAvatarEmoji: {
    fontSize: 16,
    color: GOLD,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: TEXT_MAIN,
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
  statusText: {
    fontSize: 11,
    color: TEXT_MUTED,
    letterSpacing: 0.3,
  },
  headerDivider: {
    height: 0.5,
    backgroundColor: GOLD_BORDER,
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
  loadingText: {
    fontSize: 13,
    color: TEXT_MUTED,
  },

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
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },

  // Avatar IA
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarEmoji: {
    fontSize: 14,
    color: GOLD,
  },

  // Bulles
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  bubbleUser: {
    backgroundColor: GLASS_USER,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: LAV_BORDER,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: TEXT_MAIN,
    fontWeight: '500',
  },
  bubbleTextAI: {
    color: LAVENDER,
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
    backgroundColor: GOLD,
  },

  // Suggestions rapides
  quickPromptsWrap: {
    paddingVertical: 10,
  },
  quickPromptsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickPrompt: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: LAV_BORDER,
  },
  quickPromptText: {
    fontSize: 13,
    color: LAVENDER,
    fontWeight: '500',
  },

  // Zone de saisie
  inputWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(3,2,15,0.95)',
    borderTopWidth: 0.5,
    borderTopColor: GOLD_BORDER,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_MAIN,
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
  sendButtonActive: {
    backgroundColor: GOLD,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
