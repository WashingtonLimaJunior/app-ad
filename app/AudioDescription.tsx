import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const AudioDescription = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  useEffect(() => {
    loadImageLocally();
    requestPermission();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua biblioteca de imagens para continuar.');
    }
  };

  const saveImageLocally = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('selectedImage', imageUri);
      console.log('Imagem salva localmente:', imageUri);
    } catch (error) {
      console.error('Erro ao salvar imagem localmente:', error);
    }
  };

  const loadImageLocally = async () => {
    try {
      const imageUri = await AsyncStorage.getItem('selectedImage');
      if (imageUri) {
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem localmente:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const pickedImageUri = result.assets[0].uri;
      setSelectedImage(pickedImageUri);
      saveImageLocally(pickedImageUri);
      await uploadImage(pickedImageUri);
    }
  };

  const uploadImage = async (uri: string) => {
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('upload', {
      uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any); // Type assertion for TypeScript

    try {
      console.log('Enviando imagem para o servidor...');
      const response = await fetch('https://5110-168-0-235-65.ngrok-free.app/describe', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Erro na resposta da rede: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Resposta do servidor:', data);
      setDescription(data.description);
      await playAudio(data.audioPath); // URL do áudio gerado
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao descrever imagem:', error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }
    }
  };

  const playAudio = async (audioUri: string) => {
    try {
      console.log('Iniciando a reprodução do áudio:', audioUri);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound, status } = await Audio.Sound.createAsync({ uri: audioUri }, {}, async (status) => {
        if (status.isLoaded && !status.isPlaying) {
          const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
          console.log(`Reproduzindo áudio no caminho: ${audioUri} com duração de: ${duration} segundos`);
          setAudioPath(audioUri);
          setAudioDuration(duration);
        }
      });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Erro ao reproduzir o áudio:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Escolher uma imagem" onPress={pickImage} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
      {description && <Text style={styles.description}>{description}</Text>}
      {audioPath && audioDuration && (
        <Text style={styles.audioInfo}>
          Reproduzindo áudio no caminho: {audioPath} com duração de: {audioDuration} segundos
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    margin: 20,
  },
  description: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
  },
  audioInfo: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
  },
});

export default AudioDescription;
