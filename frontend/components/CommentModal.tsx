import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

interface CommentModalProps {
  visible: boolean;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ visible, onSubmit, onCancel }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
  };

  const handleCancel = () => {
    onCancel();
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{i18n.t('comment')}</Text>
          <Text style={styles.optional}>{i18n.t('optional')}</Text>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder={i18n.t('commentPlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            autoFocus
          />
          <Text style={styles.example}>{i18n.t('commentExample')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelText}>{i18n.t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.submitText}>{i18n.t('next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    marginTop: -100,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 12,
  },
  optional: {
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  example: {
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  submitButton: {
    backgroundColor: colors.primary[500],
  },
  cancelText: {
    color: colors.neutral[700],
    fontSize: 16,
    fontWeight: '600',
  },
  submitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommentModal; 