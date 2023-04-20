import * as yup from "yup";
import { useForm } from "react-hook-form";
import { LatLng } from "react-native-maps";
import { CheckBox } from "react-native-elements";
import React, { useEffect, useState } from "react";
import { ImagePickerResult } from "expo-image-picker";
import { yupResolver } from "@hookform/resolvers/yup";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Submit } from "../Submit";
import { InputControl } from "../InputControl";
import SightingImagePicker from "../SightingPhoto";
import { CustomCheckBox } from "../CustomCheckbox";
import InformLocationModal from "../../InformLocationModal";
import { DescriptionInputControl } from "../DescriptionInputControl";
import { InformLocationContent } from "../../InformLocationContent";
import { AddEntityLocationButton } from "../AddEntityLocationButton";
import { RegisterEntityRouteParams } from "../../../pages/RegisterSighting";

import {
  CheckboxContainer,
  CheckboxText,
  Container,
  FirstRowContainer,
  InputAndInputError,
  LoadingBar,
} from "./style";

import useFlora, { Flora } from "../../../hooks/useFlora";

import { storage } from "../../../services/firebaseConfig";
import * as FileSystem from "expo-file-system";

type FormData = {
  species: string;
  description: string;
  location: LatLng;
  identifiedSpecies: boolean;
};

export interface RegisterData {
  species: string;
  description: string;
  location: LatLng;
  image: string;
  identifiedSpecies: boolean;
}

async function uploadImageAsync(
  uri: string,
  imageName: string
): Promise<string> {
  const blob: Blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const ref = storage.ref().child("images/" + imageName);
  const snapshot = await ref.put(blob);

  const downloadURL = await snapshot.ref.getDownloadURL();
  return downloadURL;
}

const getSchema = (identifiedSpecies: boolean) =>
  yup.object({
    species: yup
      .string()
      .test(
        "identifiedSpecies",
        "A espécie é obrigatória",
        (value) => !identifiedSpecies || Boolean(value && value.length > 0)
      ),
    description: yup.string().required("A descrição é obrigatória"),
  });

export function Form({ coordinates }: RegisterEntityRouteParams) {
  const { navigate } =
    useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const { saveFlora, loading, error } = useFlora();
  const [image, setImage] = useState<string | null>(null);
  const [identifiedSpecies, setIdentifiedSpecies] = useState(false);

  const [informLocationModalVisible, setInformLocationModalVisible] =
    useState(false);

  async function handleSubmitFloraSighting(data: FormData) {
    if (coordinates == undefined) {
      setInformLocationModalVisible(true);
      return;
    }

    if (data.identifiedSpecies && data.species == "") {
      return;
    }

    let flora_sighting = {} as Flora;

    let imageUrl: string | null = null;
    if (image) {
      const imageName = `flora-${Date.now()}.jpg`;
      imageUrl = await uploadImageAsync(image, imageName);
    }

    flora_sighting.identified_species = identifiedSpecies;

    if (identifiedSpecies) {
      flora_sighting.species = data.species;
    } else {
      flora_sighting.species = "";
    }

    flora_sighting.description = data.description;

    flora_sighting.location = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    flora_sighting.photo = imageUrl as string;
    flora_sighting.date = new Date(Date.now());

    await saveFlora(flora_sighting);
    navigate("flora_sightings");
  }

  const handleImagePicker = (result: ImagePickerResult) => {
    if (!result.canceled) {
      const { uri, width, height } = result.assets[0];
      setImage(uri);
    }
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(getSchema(identifiedSpecies)),
    defaultValues: {
      species: "",
      description: "",
    },
  });

  const speciesValue = watch("species");

  useEffect(() => {
    if (identifiedSpecies && (!speciesValue || speciesValue.length === 0)) {
      setError("species", { message: "A espécie é obrigatória" });
    } else {
      clearErrors("species");
    }
  }, [identifiedSpecies, setError, clearErrors, speciesValue]);

  return (
    <Container>
      <InformLocationModal
        visible={informLocationModalVisible}
        onClose={() => {
          setInformLocationModalVisible(false);
        }}
      >
        <InformLocationContent info="Por favor informe o local do avistamento!" />
      </InformLocationModal>
      <SightingImagePicker pickImage={handleImagePicker} />
      <FirstRowContainer>
        <CheckboxContainer>
          <CheckBox
            checked={identifiedSpecies}
            onPress={() => {
              setIdentifiedSpecies(!identifiedSpecies);
              setValue("species", "");
            }}
            checkedIcon={<CustomCheckBox checked />}
            uncheckedIcon={<CustomCheckBox checked={false} />}
          />
          <CheckboxText>Flora identificada</CheckboxText>
        </CheckboxContainer>
        <InputAndInputError>
          <InputControl
            control={control}
            name="species"
            placeholder="Qual é a espécie?"
            error={errors.species}
            editable={identifiedSpecies}
            isActive={identifiedSpecies}
          />
        </InputAndInputError>
      </FirstRowContainer>
      <DescriptionInputControl
        control={control}
        name="description"
        placeholder={
          "Como é o animal que foi avistado? Busque descrever dados relevantes para identificar o animal, como tamanho, tipo de pele, coloração, presença de cauda ou asas etc."
        }
        error={errors.description}
        multiline
      />
      <AddEntityLocationButton
        title="SELECIONAR LOCALIZAÇÃO DA FLORA"
        onPress={() => navigate("select_flora_spot")}
        activeOpacity={0.7}
      />
      <Submit
        title="REGISTRAR FLORA"
        onPress={handleSubmit(handleSubmitFloraSighting)}
        activeOpacity={0.7}
      />
      {loading && <LoadingBar color="#216C2E" />}
    </Container>
  );
}