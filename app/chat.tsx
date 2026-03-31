import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

const QUICK_PROMPTS = [
  'Je me sens submergée',
  "Je n'arrive pas à dormir",
  'Je rumine trop',
  "J'ai besoin de réconfort",
  'Je suis épuisée émotionnellement',
];

type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

function ChatBubble({ message, colors }: { message: LocalMessage; colors: ReturnType<typeof useColors> }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={styles.avatarEmoji}>🌸</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : colors.foreground }]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history from backend (authenticated users)
  const { data: historyData, isLoading: historyLoading } = trpc.chat.history.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation();

  // Clear history mutation
  const clearMutation = trpc.chat.clear.useMutation({
    onSuccess: () => setLocalMessages([]),
  });

  // Sync history into local state on load
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
      // Show welcome message if no history
      setLocalMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Bonjour 🌸 Je suis Yoya, ton assistante bien-être. Je suis là pour t'écouter et te soutenir. Comment te sens-tu aujourd'hui ?\n\n⚠️ Je suis un outil de soutien au bien-être, pas un professionnel de santé. En cas de détresse sévère, contacte un professionnel.",
      }]);
    }
  }, [historyData, historyLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    const trimmed = text.trim();
    setInput('');

    // Optimistic: add user message immediately
    const tempId = Date.now().toString();
    setLocalMessages((prev) => [...prev, { id: tempId, role: 'user', content: trimmed }]);
    setIsTyping(true);

    try {
      if (isAuthenticated) {
        // Real AI via tRPC
        const result = await sendMutation.mutateAsync({ message: trimmed });
        setLocalMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: result.reply },
        ]);
      } else {
        // Fallback for unauthenticated users
        await new Promise((r) => setTimeout(r, 1000));
        setLocalMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Pour accéder à l'assistante IA personnalisée, connecte-toi à ton compte. Je suis là pour toi ! 🌸",
          },
        ]);
      }
    } catch {
      setLocalMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Je suis momentanément indisponible. Prends une grande inspiration — tu n'es pas seule. 🌸",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function confirmClear() {
    Alert.alert(
      'Effacer la conversation',
      'Es-tu sûre de vouloir effacer tout l\'historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            if (isAuthenticated) {
              clearMutation.mutate();
            } else {
              setLocalMessages([]);
            }
          },
        },
      ]
    );
  }

  const showQuickPrompts = localMessages.length <= 1;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Soutien bien-être</Text>
            <View style={styles.onlineIndicator}>
              <View style={[styles.onlineDot, { backgroundColor: isAuthenticated ? colors.success : colors.warning }]} />
              <Text style={[styles.onlineText, { color: colors.muted }]}>
                {isAuthenticated ? 'IA connectée' : 'Mode hors ligne'}
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            onPress={confirmClear}
          >
            <IconSymbol name="trash" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Loading state */}
        {historyLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Chargement de l'historique...</Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={localMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} colors={colors} />}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={styles.avatarEmoji}>🌸</Text>
                </View>
                <View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                  <Text style={[styles.typingDots, { color: colors.muted }]}>● ● ●</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick prompts */}
        {showQuickPrompts && (
          <View style={styles.quickPrompts}>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.quickPrompt,
                    { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => sendMessage(item)}
                >
                  <Text style={[styles.quickPromptText, { color: colors.foreground }]}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Input */}
        <View style={[styles.inputRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
            ]}
            placeholder="Exprime-toi librement..."
            placeholderTextColor={colors.muted}
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
              {
                backgroundColor: input.trim() && !isTyping ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
          >
            {isTyping
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 11 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  loadingText: { fontSize: 13 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 16 },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  typingIndicator: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 },
  typingDots: { fontSize: 14, letterSpacing: 2 },
  quickPrompts: { paddingVertical: 10 },
  quickPrompt: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  quickPromptText: { fontSize: 13, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16,
    paddingVertical: 10, borderTopWidth: 0.5, gap: 10, paddingBottom: 20,
  },
  textInput: {
    flex: 1, borderRadius: 20, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 100,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
