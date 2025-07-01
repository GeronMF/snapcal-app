import { AI_LOADING_CONFIG } from '@/constants/aiLoadingConfig';
import colors from '@/constants/colors';
import i18n from '@/i18n';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface AILoadingModalProps {
  visible: boolean;
}

// Глобальная переменная для отслеживания предзагрузки
let gifPreloaded = false;
let preloadPromise: Promise<boolean> | null = null;

// Функция предзагрузки GIF
const preloadGifGlobally = (): Promise<boolean> => {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = new Promise((resolve) => {
    if (gifPreloaded) {
      resolve(true);
      return;
    }

    const gifSource = require('@/assets/images/ai-loading.gif');
    const imageUri = Image.resolveAssetSource(gifSource).uri;
    
    console.log('🔄 Начинаем предзагрузку GIF...');
    
    Image.prefetch(imageUri)
      .then(() => {
        gifPreloaded = true;
        console.log('✅ GIF предзагружен успешно');
        resolve(true);
      })
      .catch((error) => {
        console.warn('⚠️ Ошибка предзагрузки GIF:', error);
        // Считаем предзагруженным даже в случае ошибки
        gifPreloaded = true;
        resolve(false);
      });
  });

  return preloadPromise;
};

// Предзагружаем GIF при загрузке модуля
preloadGifGlobally();

export default function AILoadingModal({ visible }: AILoadingModalProps) {
  const [gifLoaded, setGifLoaded] = useState(gifPreloaded);
  const [forceShowFallback, setForceShowFallback] = useState(false);
  const dotAnimations = [
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ];

  // Проверяем состояние предзагрузки при каждом открытии модального окна
  useEffect(() => {
    if (visible && !gifLoaded) {
      console.log('🔍 Проверяем предзагрузку GIF...');
      
      // Даем время на предзагрузку, но не более 2 секунд
      const timeoutId = setTimeout(() => {
        console.log('⏰ Таймаут предзагрузки, показываем fallback');
        setForceShowFallback(true);
      }, 2000);

      preloadGifGlobally().then((success) => {
        clearTimeout(timeoutId);
        setGifLoaded(true);
        if (!success) {
          setForceShowFallback(true);
        }
      });

      return () => clearTimeout(timeoutId);
    }
  }, [visible, gifLoaded]);

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
            {gifLoaded && !forceShowFallback ? (
              <Image 
                source={require('@/assets/images/ai-loading.gif')} 
                style={styles.gif}
                resizeMode="contain"
                onError={() => {
                  console.warn('⚠️ Ошибка загрузки GIF, переключаемся на fallback');
                  setForceShowFallback(true);
                }}
              />
            ) : (
              <View style={styles.fallbackContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.fallbackText}>Анализируем...</Text>
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
  fallbackText: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    marginTop: 12,
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