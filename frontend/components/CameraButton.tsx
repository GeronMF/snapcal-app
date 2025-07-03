import { Camera, FileText, Plus } from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import colors from '../constants/colors';
import i18n from '../i18n';

type CameraButtonProps = {
  onPress: () => void;
  isLoading?: boolean;
};

const CameraButton: React.FC<CameraButtonProps> = ({ 
  onPress, 
  isLoading = false 
}) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.white} />
      ) : (
        <View style={styles.buttonContent}>
          <Plus 
            color={colors.white} 
            size={36} 
            strokeWidth={2.5}
            style={styles.plusIcon}
          />
          <Camera 
            color={colors.white} 
            size={24} 
            strokeWidth={2.5}
            style={styles.leftIcon}
          />
          <Text style={styles.text}>{i18n.t('addFoodPortion')}</Text>
          <FileText 
            color={colors.white} 
            size={24} 
            strokeWidth={2.5}
            style={styles.rightIcon}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: 16,
    marginVertical: 24,
    minHeight: 60,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 12,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  rightIcon: {
    marginLeft: 12,
  },
});

export default CameraButton;