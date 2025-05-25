import React from 'react';
import { ScrollView, Text } from 'react-native';
import globalStyles from '../styles/globalStyles';

const { container, title, text } = globalStyles;

export default function SobreScreen() {
    return (
        <ScrollView contentContainerStyle={container}>
            <Text style={title}>🚀 Sobre o MotoPatio</Text>

            <Text style={text}>
                O MotoPatio é um aplicativo desenvolvido para realizar o mapeamento inteligente e a gestão de motos
                em pátios. Permite o cadastro de motos, a gestão de informações detalhadas, além da administração
                de pátios com seus respectivos dados de localização.
            </Text>

            <Text style={[title, { marginTop: 20 }]}>👨‍💻 Desenvolvedores</Text>

            <Text style={text}>- Nome: Rafael Rodrigues de Almeida</Text>
            <Text style={text}>- RM: 557837</Text>

            <Text style={text}>- Nome: Lucas Kenji Miyahira</Text>
            <Text style={text}>- RM: 555368</Text>

            <Text style={[title, { marginTop: 20 }]}>📱 Tecnologias Utilizadas</Text>

            <Text style={text}>- React Native</Text>
            <Text style={text}>- Expo</Text>
            <Text style={text}>- AsyncStorage</Text>
            <Text style={text}>- React Navigation</Text>

            <Text style={[title, { marginTop: 20 }]}>📄 Licença</Text>

            <Text style={text}>
                Este aplicativo foi desenvolvido exclusivamente para fins acadêmicos na disciplina de Mobile Application Development.
            </Text>
        </ScrollView>
    );
}
