import Container from "@/components/Container";
import HomeHeader from "@/components/HomeHeader";
import RecentRoute from "@/components/RecentRoute";
import SafetyMapPreview from "@/components/SafetyMapPreview";
import SearchBar from "@/components/SearchBar";

export default function HomeScreen() {
  return (
    <Container>
      <HomeHeader />
      <SearchBar />
      {/* FavoritePlacesList */}
      {/* <FavoritePlacesList /> */}
      <SafetyMapPreview />
      <RecentRoute />
    </Container>
  );
}
