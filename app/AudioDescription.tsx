import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AudioDescription = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const pickedImageUri = result.assets[0].uri;
      const file = await uriToFile(pickedImageUri);
      const formData = toFormData(file);
      setSelectedImage(pickedImageUri); // Define a imagem selecionada
      saveImageLocally(pickedImageUri); // Salva a imagem localmente
      // Envie o formData para o servidor usando axios
      axios.post('http://localhost:3000/describe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        setDescription(response.data.description);
      })
      .catch(error => {
        console.error(error);
      });
    }
  };
  
  async function uriToFile(uri: string): Promise<File> {
    return fetch(uri)
      .then(response => response.blob())
      .then(blob => new File([blob], 'image.jpg'));
  }
  
  function toFormData(file: File) {
    const formData = new FormData();
    formData.append('upload', file);
    return formData;
  }
  

  useEffect(() => {
    loadImageLocally();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Pick an image" onPress={pickImage} />
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
      {description && <Text style={styles.description}>{description}</Text>}
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
});

export default AudioDescription;
