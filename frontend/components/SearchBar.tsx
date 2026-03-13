import { colors } from "@/constants/colors";
import { useAppDispatch } from "@/store/hooks";
import { setDestination, setOrigin } from "@/store/safeRouteSlice";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export default function SearchBar() {
  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const dispatch = useAppDispatch();

  return (
    <View>
      <GooglePlacesAutocomplete
        enablePoweredByContainer={false}
        styles={autocompleteStyles}
        placeholder="Where are you heading?"
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={400}
        fetchDetails={true}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: "en",
        }}
        renderLeftButton={() => (
          <View style={styles.leftIconContainer}>
            <Feather name="search" size={20} color={colors.primary} />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "#94A3B8",
          autoCapitalize: "none",
          autoCorrect: false,
          selectionColor: colors.primary,
        }}
        minLength={2}
        enableHighAccuracyLocation={true}
        onPress={(data, details = null) => {
          dispatch(
            setOrigin({
              location: details?.geometry?.location,
              description: data.description,
            }),
          );
          dispatch(setDestination(null));
        }}
      />
    </View>
  );
}

const autocompleteStyles = StyleSheet.create({
  container: {
    flex: 0,
    marginTop: 12,
    marginBottom: 14,
  },
  textInput: {
    height: 48,
    marginVertical: 0,
    paddingLeft: 10,
    backgroundColor: "transparent",
    color: "#334155",
    fontSize: 15,
    fontWeight: "500",
  },
  textInputContainer: {
    minHeight: 52,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    paddingLeft: 8,
    paddingRight: 10,
  },
  listView: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
  },
  row: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
  },
  description: {
    color: "#334155",
  },
  separator: {
    backgroundColor: "#E2E8F0",
  },
});

const styles = StyleSheet.create({
  leftIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 2,
  },
});
