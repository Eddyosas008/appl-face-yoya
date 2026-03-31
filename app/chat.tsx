import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ChatMessage } from '@/shared/wellness-types';

const QUICK_PROMPTS = [
  'Je me sens submergée',
  'Je n\'arrive pas à dormir',
  'Je rumine trop',
  'J\'ai besoin de réconfort',
  'Je suis épuisée émotionnellement',
];

const AI_RESPONSES: Record<string, string> = {
  default: 'Je vous entends. Vos émotions sont valides. Prenez une grande inspiration et sachez que vous n\'êtes pas seule dans ce que vous ressentez. Que puis-je faire pour vous aider en ce moment ?',
  submergée: 'Quand tout semble trop lourd, c\'est normal de se sentir submergée. Votre corps et votre esprit vous envoient un signal : vous avez besoin de ralentir. Essayons ensemble une respiration apaisante. Inspirez lentement pendant 4 secondes... retenez 4 secondes... expirez doucement pendant 6 secondes. Comment vous sentez-vous maintenant ?',
  dormir: 'Les nuits difficiles peuvent être épuisantes. Votre esprit cherche peut-être à traiter quelque chose. Avez-vous essayé notre méditation "Nuit étoilée" ? Elle aide beaucoup à calmer les pensées avant de dormir. En attendant, essayez de vous concentrer sur 5 choses que vous pouvez voir autour de vous — cela ancre dans le présent.',
  rumine: 'La rumination est comme un disque rayé — votre esprit tourne en boucle sans trouver de solution. C\'est épuisant. Une technique qui aide : notez vos pensées sur papier pour "les sortir" de votre tête. Ensuite, demandez-vous : "Cette pensée est-elle un fait ou une interprétation ?" Souvent, c\'est une interprétation.',
  réconfort: 'Je suis là. Vous méritez d\'être entendue et soutenue. Parfois, nous avons juste besoin que quelqu\'un nous dise que tout va bien se passer. Alors voilà : vous traversez quelque chose de difficile, mais vous êtes plus forte que vous ne le pensez. Qu\'est-ce qui vous ferait du bien en ce moment ?',
  épuisée: 'L\'épuisement émotionnel est réel et sérieux. Ce n\'est pas de la faiblesse — c\'est le signe que vous avez donné beaucoup de vous-même. Il est temps de vous recharger. Commencez par une chose simple : accordez-vous 10 minutes juste pour vous, sans obligation. Qu\'est-ce qui vous ressource habituellement ?',
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('submerg') || lower.includes('trop')) return AI_RESPONSES.submergée;
  if (lower.includes('dorm') || lower.includes('nuit') || lower.includes('sommeil')) return AI_RESPONSES.dormir;
  if (lower.includes('rumin') || lower.includes('boucle') || lower.includes('pens')) return AI_RESPONSES.rumine;
  if (lower.includes('réconfort') || lower.includes('seule') || lower.includes('besoin')) return AI_RESPONSES.réconfort;
  if (lower.includes('épuis') || lower.includes('fatig') || lower.includes('drain')) return AI_RESPONSES.épuisée;
  return AI_RESPONSES.default;
}

function ChatBubble({ message, colors }: { message: ChatMessage; colors: ReturnType<typeof useColors> }) {
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Bonjour 🌸 Je suis votre assistante bien-être. Je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd\'hui ?\n\n⚠️ Je suis un outil de soutien au bien-être, pas un professionnel de santé. En cas de détresse sévère, veuillez contacter un professionnel.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  }

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
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.onlineText, { color: colors.muted }]}>Disponible</Text>
            </View>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
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
        {messages.length <= 1 && (
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
            placeholder="Exprimez-vous librement..."
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
                backgroundColor: input.trim() ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 11,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  typingDots: {
    fontSize: 14,
    letterSpacing: 2,
  },
  quickPrompts: {
    paddingVertical: 10,
  },
  quickPrompt: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    gap: 10,
    paddingBottom: 20,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
