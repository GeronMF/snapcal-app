import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Camera } from 'lucide-react-native';
import i18n from '../i18n';
import colors from '../constants/colors';

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
        <>
          <Camera 
            color={colors.white} 
            size={32} 
            strokeWidth={2.5}
          />
          <Text style={styles.text}>{i18n.t('takePicture')}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const buttonSize = Math.min(width * 0.6, 240);

const styles = StyleSheet.create({
  button: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignSelf: 'center',
    marginVertical: 24,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
});

export default CameraButton;