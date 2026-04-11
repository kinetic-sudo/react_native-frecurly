import { icons } from "@/constants/icons";
import { getIconAsset } from "@/lib/utils/SubscriptionIcon";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Frequency = "Monthly" | "Yearly";
type Category = "Entertainment" | "AI Tools" | "Developer Tools" | "Design" | "Productivity" | "Cloud" | "Music" | "Other";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES: Category[] = [
  "Entertainment", "AI Tools", "Developer Tools", "Design",
  "Productivity", "Cloud", "Music", "Other",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#ea7a53",
  "AI Tools": "#8fd1bd",
  "Developer Tools": "#081126",
  Design: "#ea7a53",
  Productivity: "#16a34a",
  Cloud: "#8fd1bd",
  Music: "#ea7a53",
  Other: "#f6eecf",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Other");

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
  };

  const isValid = () => {
    const trimmedName = name.trim();
    const numPrice = parseFloat(price);
    return trimmedName.length > 0 && numPrice > 0 && !isNaN(numPrice);
  };

  const handleSubmit = () => {
    if (!isValid()) return;
    const now = dayjs();
    const renewalDate = frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");
    const iconAsset = getIconAsset(name.trim().toLowerCase());


    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: parseFloat(price),
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: iconAsset ?? icons.wallet, // kept for type compatibility, ignored at render
      billing: frequency,
      color: CATEGORY_COLORS[category],
      currency: "USD",
    };

    onSubmit(newSubscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="modal-overlay" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="modal-container">

              {/* Drag handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(0,0,0,0.15)",
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              />

              {/* Header */}
              <View className="modal-header" style={{ marginBottom: 24 }}>
                <Text className="modal-title">New Subscription</Text>
                <TouchableOpacity
                  className="modal-close"
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Text className="modal-close-text">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                className="modal-body"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: Platform.OS === "ios" ? 48 : 32,
                  gap: 4,
                }}
              >
                {/* Name Field */}
                <View className="auth-field" style={{ marginBottom: 20 }}>
                  <Text className="auth-label" style={{ marginBottom: 8 }}>Service Name</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="e.g., Netflix"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Price Field */}
                <View className="auth-field" style={{ marginBottom: 20 }}>
                  <Text className="auth-label" style={{ marginBottom: 8 }}>Price (USD)</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="0.00"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Billing Cycle */}
                <View className="auth-field" style={{ marginBottom: 20 }}>
                  <Text className="auth-label" style={{ marginBottom: 8 }}>Billing Cycle</Text>
                  <View className="picker-row">
                    {(["Monthly", "Yearly"] as Frequency[]).map((f) => (
                      <TouchableOpacity
                        key={f}
                        className={clsx(
                          "picker-option",
                          frequency === f && "picker-option-active"
                        )}
                        onPress={() => setFrequency(f)}
                        accessibilityRole="button"
                        accessibilityLabel={f}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            frequency === f && "picker-option-text-active"
                          )}
                        >
                          {f}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Category */}
                <View className="auth-field" style={{ marginBottom: 28 }}>
                  <Text className="auth-label" style={{ marginBottom: 10 }}>Category</Text>
                  <View className="category-scroll" style={{ gap: 8 }}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        className={clsx(
                          "category-chip",
                          category === cat && "category-chip-active"
                        )}
                        onPress={() => setCategory(cat)}
                        accessibilityRole="button"
                        accessibilityLabel={cat}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            category === cat && "category-chip-text-active"
                          )}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  className={clsx(
                    "auth-button",
                    !isValid() && "auth-button-disabled"
                  )}
                  onPress={handleSubmit}
                  disabled={!isValid()}
                  accessibilityRole="button"
                  accessibilityLabel="Create subscription"
                >
                  <Text className="auth-button-text">Create Subscription</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}