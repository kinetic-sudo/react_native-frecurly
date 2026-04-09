import { icons } from "@/constants/icons";
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
type Category =
  | "Entertainment"
  | "AI Tools"
  | "Developer Tools"
  | "Design"
  | "Productivity"
  | "Cloud"
  | "Music"
  | "Other";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CATEGORIES: Category[] = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#b8d4e3",
  Music: "#f5c542",
  Other: "#e8def8",
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
    const renewalDate =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const newSubscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      price: parseFloat(price),
      category,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
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
              {/* Header */}
              <View className="modal-header">
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
              <ScrollView className="modal-body" showsVerticalScrollIndicator={false}>
                {/* Name Field */}
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
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
                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    placeholder="0.00"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Frequency Picker */}
                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    <TouchableOpacity
                      className={clsx(
                        "picker-option",
                        frequency === "Monthly" && "picker-option-active"
                      )}
                      onPress={() => setFrequency("Monthly")}
                      accessibilityRole="button"
                      accessibilityLabel="Monthly"
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Monthly" && "picker-option-text-active"
                        )}
                      >
                        Monthly
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={clsx(
                        "picker-option",
                        frequency === "Yearly" && "picker-option-active"
                      )}
                      onPress={() => setFrequency("Yearly")}
                      accessibilityRole="button"
                      accessibilityLabel="Yearly"
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Yearly" && "picker-option-text-active"
                        )}
                      >
                        Yearly
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Category Selection */}
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
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

                {/* Submit Button */}
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