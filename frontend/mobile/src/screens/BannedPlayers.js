import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useGamer } from "../contexts/GamerContext";
import { logoXml } from "../utils/logo";
import { SvgXml } from "react-native-svg";

const BannedPlayers = () => {
  const [bannedPlayers, setBannedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { gamerId } = useGamer();

  useEffect(() => {
    const fetchBannedPlayers = async () => {
      try {
        setLoading(true);

        // Fetch the bannedPlayers list from publicans collection
        const publicanRef = doc(db, "publicans", gamerId);
        const publicanSnap = await getDoc(publicanRef);

        if (!publicanSnap.exists()) {
          console.warn("Publican document not found");
          setLoading(false);
          return;
        }

        const publicanData = publicanSnap.data();
        const bannedIds = publicanData.bannedPlayers || [];
        console.log("Banned Player IDs:", bannedIds);

        if (bannedIds.length === 0) {
          setBannedPlayers([]);
          setLoading(false);
          return;
        }

        // Fetch details of each banned player from "gamers" collection
        const bannedUsersPromises = bannedIds.map(async (bannedId) => {
          const gamerRef = doc(db, "gamers", bannedId);
          const gamerSnap = await getDoc(gamerRef);
          console.log(`Fetching gamerId: ${bannedId}`);

          if (gamerSnap.exists()) {
            const gamerData = gamerSnap.data();
            console.log(`Fetched Gamer Data for ${bannedId}:`, gamerData);

            return {
              id: bannedId,
              fullName: gamerData.fullName || "Unknown Player",
              email: gamerData.email || "No email provided",
              gamerId: gamerData.gamerId || "N/A",
              profile: gamerData.profile || "No profile",
              createdAt: gamerData.createdAt
                ? new Date(gamerData.createdAt.toDate()).toLocaleDateString()
                : "Unknown date",
            };
          }

          console.warn(`Gamer document not found for ID: ${bannedId}`);
          return {
            id: bannedId,
            fullName: "Unknown Player",
            email: "N/A",
            gamerId: "N/A",
            profile: "N/A",
          };
        });

        const bannedUsers = await Promise.all(bannedUsersPromises);
        console.log("Fetched Banned Users:", bannedUsers);

        setBannedPlayers(bannedUsers);
      } catch (error) {
        console.error("Error fetching banned players:", error);
        setError("Failed to load banned players");
      } finally {
        setLoading(false);
      }
    };

    if (gamerId) {
      fetchBannedPlayers();
    }
  }, [gamerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading banned players...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity>
            <SvgXml xml={logoXml} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>Banned Player</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {bannedPlayers.length === 0 ? (
            <Text style={styles.emptyText}>No players banned.</Text>
          ) : (
            bannedPlayers.map((player, index) => (
              <View key={player.id || index} style={styles.playerItem}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerName}>
                    {player.fullName || "Unknown Player"}
                  </Text>
                  <Text style={styles.playerBadge}>Banned</Text>
                </View>

                <View style={styles.playerDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gamer ID:</Text>
                    <Text style={styles.detailValue}>{player.gamerId}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{player.email}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Profile:</Text>
                    <Text style={styles.detailValue}>{player.profile}</Text>
                  </View>

                  {player.createdAt && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Joined:</Text>
                      <Text style={styles.detailValue}>{player.createdAt}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 16,
    paddingTop: 10,
    backgroundColor: "#00B4D8",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 10,
    flex: 1,
    color: "#000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#00B4D8",
  },
  container: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
    color: "#212529",
  },
  emptyText: {
    color: "#666",
    fontStyle: "italic",
  },
  errorText: {
    color: "#FF007A",
    marginVertical: 10,
  },
  playerItem: {
    marginBottom: 16,
    backgroundColor: "#f5f7f9",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#eef0f2",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  playerName: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  playerBadge: {
    backgroundColor: "#FF5252",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  playerDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  detailLabel: {
    width: 80,
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    color: "#333",
    fontSize: 14,
  },
  playerEmail: {
    color: "#666",
    fontSize: 13,
    marginTop: 3,
  },
});

export default BannedPlayers;
