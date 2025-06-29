import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import colors from '@/constants/colors';
import i18n from '@/i18n';
import { AI_LOADING_CONFIG } from '@/constants/aiLoadingConfig';

interface AILoadingModalProps {
  visible: boolean;
}

export default function AILoadingModal({ visible }: AILoadingModalProps) {
  const [gifLoaded, setGifLoaded] = useState(false);
  const dotAnimations = [
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ];

  // Предзагрузка GIF
  useEffect(() => {
    const preloadGif = () => {
      const gifSource = require('@/assets/images/ai-loading.gif');
      Image.prefetch(Image.resolveAssetSource(gifSource).uri)
        .then(() => {
          setGifLoaded(true);
          console.log('✅ GIF предзагружен успешно');
        })
        .catch((error) => {
          console.warn('⚠️ Ошибка предзагрузки GIF:', error);
          setGifLoaded(true);
        });
    };

    preloadGif();
  }, []);

  // Анимация точек
  useEffect(() => {
    if (visible) {
      // Анимация пульсирующих точек
      const animateDots = () => {
        const animations = dotAnimations.map((anim, index) =>
          Animated.sequence([
            Animated.delay(index * AI_LOADING_CONFIG.DOT_ANIMATION.DELAY_BETWEEN_DOTS),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim, {
                  toValue: AI_LOADING_CONFIG.DOT_ANIMATION.MAX_OPACITY,
                  duration: AI_LOADING_CONFIG.DOT_ANIMATION.DURATION,
                  useNativeDriver: true,
                }),
                Animated.timing(anim, {
                  toValue: AI_LOADING_CONFIG.DOT_ANIMATION.MIN_OPACITY,
                  duration: AI_LOADING_CONFIG.DOT_ANIMATION.DURATION,
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        );
        
        Animated.parallel(animations).start();
      };

      animateDots();

      return () => {
        dotAnimations.forEach(anim => anim.stopAnimation());
      };
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.gifContainer}>
            {gifLoaded ? (
              <Image 
                source={require('@/assets/images/ai-loading.gif')} 
                style={styles.gif}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.fallbackContainer}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.text}>{i18n.t('analyzing')}</Text>
            <View style={styles.dotsContainer}>
              {dotAnimations.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: anim,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: AI_LOADING_CONFIG.COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifContainer: {
    width: 300,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.white,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    marginBottom: 20,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
  },
  textContainer: {
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginHorizontal: 3,
  },
}); 