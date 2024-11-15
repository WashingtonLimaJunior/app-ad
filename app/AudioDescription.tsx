import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AudioDescription = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para continuar.');
    }
  };

  const captureAndUploadImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Não permite edição
      quality: 1,
    });

    if (!result.canceled) {
      const capturedImageUri = result.assets[0].uri;
      setSelectedImage(capturedImageUri);
      await uploadImage(capturedImageUri);
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
      const response = await fetch('https://cbec-168-0-235-13.ngrok-free.app/describe', {
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
      setDescription(data.description); // Apenas define a descrição do texto
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao descrever imagem:', error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }
    }
  };

  return (
    <ImageBackground source={require('../assets/AD.jpg')} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={captureAndUploadImage}>
          <Text style={styles.buttonText}>Abrir câmera</Text>
        </TouchableOpacity>
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    // opacity: 0.7, // Define a opacidade da imagem (valor entre 0 e 1)
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '80%',
  },
  button: {
    backgroundColor: '#347344',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
});

export default AudioDescription;
