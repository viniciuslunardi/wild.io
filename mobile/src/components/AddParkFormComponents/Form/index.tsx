import * as yup from "yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { ParamListBase, useNavigation } from "@react-navigation/native";
import { AddEntityLocationButton } from "../../AddSightingFormComponents/AddEntityLocationButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Submit } from "../Submit";
import { InputControl } from "../InputControl";
import InformLocationModal from "../../InformLocationModal";
import { DescriptionInputControl } from "../DescriptionInputControl";
import { RegisterEntityRouteParams } from "../../../pages/RegisterSighting";

import { Container } from "./style";
import { LatLng } from "react-native-maps";
import { InformLocationContent } from "../../InformLocationContent";

type FormData = {
  species: string;
  description: string;
  location: LatLng;
};

interface ParkRegisterData {
  name: string;
  description: string;
  location: LatLng;
}

const schema = yup.object({
  species: yup.string().required("O nome do parque é obrigatório"),
  description: yup
    .string()
    .required("Informe pelo menos o bairro onde fica o parque!"),
});

export function Form({ coordinates }: RegisterEntityRouteParams) {
  const { navigate } =
    useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const [informLocationModalVisible, setInformLocationModalVisible] =
    useState(false);

  function handleSubmitPark(data: FormData) {
    console.log(coordinates);
    if (coordinates == undefined) {
      setInformLocationModalVisible(true);
      return;
    }

    let park = {} as ParkRegisterData;
    park.name = data.species;
    park.description = data.description;
    park.location = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    console.log(park);
    navigate("nearest_parks");
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <Container>
      <InformLocationModal
        visible={informLocationModalVisible}
        onClose={() => {
          setInformLocationModalVisible(false);
        }}
      >
        <InformLocationContent info="Por favor informe a localização do parque" />
      </InformLocationModal>
      <InputControl
        control={control}
        name="species"
        placeholder="Qual o nome oficial do parque?"
        error={errors.species}
      />
      <DescriptionInputControl
        control={control}
        name="description"
        placeholder={
          "Informe aqui o bairro onde fica o parque e quaisquer detalhes relevantes que você gostaria de incluir, como a vegetação, tamanho, ano de fundação, atividades etc."
        }
        error={errors.description}
        multiline
      />
      <AddEntityLocationButton
        title="SELECIONAR LOCALIZAÇÃO DO PARQUE"
        onPress={() => navigate("select_park_spot")}
        activeOpacity={0.7}
      />

      <Submit
        title="REGISTRAR PARQUE"
        onPress={handleSubmit(handleSubmitPark)}
        activeOpacity={0.7}
      />
    </Container>
  );
}
