import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    TextInput,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import io from "socket.io-client";
import { Ionicons } from "@expo/vector-icons"; // For icons
import "react-native-url-polyfill/auto";
import { router } from "expo-router"; // Adjust import if necessary

export default function ChatWith_Admin() {
    //   const {orderId, order} = useLocalSearchParams();
    //   const userId = order.walkerId;
    const orderId = "18";
    const userId = "1";
    const role = "walker";
    const targetRole = "admin";

    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef(null); // Reference for FlatList
    const socketRef = useRef(null); // Store socket instance in a ref

    // Initialize and manage socket connection
    useEffect(() => {
        if (!socketRef.current) {
            const newSocket = io("https://ku-man-chat.vimforlanie.com/");
            setSocket(newSocket);

            if (userId && role && orderId) {
                // Join the chat room
                newSocket.emit("joinOrderChat", { userId, role, orderId, targetRole });

                // Request chat history from the server
                newSocket.emit("requestChatHistory", { orderId });
            }

            // Listen for new messages from the server
            newSocket.on("message", (data) => {
                setMessages((prevMessages) => {
                    data.timestamp = new Date().toISOString();
                    const updatedMessages = [...prevMessages, data]; // New message without isOld
                    return updatedMessages.sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                    );
                });
                scrollToBottom();
            });

            // Listen for old messages from the server
            newSocket.on("oldMessages", (oldMessages) => {
                const oldTaggedMessages = oldMessages.map((msg) => ({ ...msg, isOld: true }));
                setMessages((prevMessages) => {
                    const combinedMessages = [...oldTaggedMessages, ...prevMessages];
                    return combinedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp
                });
                scrollToBottom();
            });




            // Cleanup on component unmount
            return () => {
                newSocket.disconnect();
            };
        }
    }, [orderId, userId, targetRole]);

    // Automatically scroll to the bottom when the chat loads or messages update
    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };


    const sendMessage = () => {
        if (socket && message.trim() !== "" && !isSending) {
            setIsSending(true);

            const newMessage = {
                orderId,
                message: message.trim(),
                senderRole: role, // The sender is the admin
                targetRole,
                timestamp: new Date().toISOString(),
            };
            // Send message to the server
            socket.emit("orderMessage", {
                orderId,
                message: message.trim(),
                role: role, // The sender is the admin
                targetRole,
                timestamp: new Date().toISOString(),
            }, (response) => {
                setIsSending(false);
                if (response && response.success) {
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages, newMessage];
                        return updatedMessages.sort(
                            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                        );
                    });
                    setMessage(""); // Clear the input field
                    scrollToBottom();
                }
            });

            setTimeout(() => {
                setIsSending(false);
                setMessage("");
            }, 100);
        } else {
            console.log("Socket not initialized or message is empty");
        }
    };


    const goBack = () => {
        router.back();
    };

    const renderChatHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Image source={require("./../assets/goBack.png")} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ติดต่อกับ Admin</Text>
        </View>
    );

    const renderMessage = ({ item }) => {
        // Use senderRole to determine if the message is from the admin or another user
        const senderRole = item.isOld ? item.senderRole : item.role;
        // const senderRole = item.senderRole;

        const messageWrapperStyle =
            senderRole === "walker" ? styles.sentMessageWrapper : styles.receivedMessageWrapper;
        const messageContentStyle =
            senderRole === "walker" ? styles.sentMessage : styles.receivedMessage;
        const messageStyle = item.isOld ? styles.oldMessage : styles.newMessage; // Apply styles for old or new messages

        console.log(item);

        return (
            <View style={[messageWrapperStyle, messageStyle]}>
                {senderRole !== "walker" && (
                    <Ionicons
                        name="person-circle-outline"
                        size={32}
                        color="green"
                        style={styles.receivedIcon}
                    />
                )}
                <View style={messageContentStyle}>
                    <Text style={styles.messageText}>{item.message}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
                {senderRole === "walker" && (
                    <Ionicons
                        name="person-circle"
                        size={32}
                        color="black"
                        style={styles.sentIcon}
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderChatHeader()}

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMessage}
                onContentSizeChange={scrollToBottom}
                keyboardShouldPersistTaps="handled"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputWrapper}
            >
                <TextInput
                    style={styles.messageInput}
                    placeholder="Send a message"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity
                    onPress={() => sendMessage(message)}
                    style={[styles.sendButton, isSending && styles.disabledButton]}
                    disabled={isSending}
                >
                    <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    backButton: {
        backgroundColor: "#fff",
    },
    sentMessageWrapper: {
        flexDirection: "row",
        justifyContent: "flex-end",
        margin: 10,
    },
    receivedMessageWrapper: {
        flexDirection: "row",
        justifyContent: "flex-start",
        margin: 10,
    },
    sentMessage: {
        backgroundColor: "#E0E0E0",
        padding: 10,
        borderRadius: 15,
    },
    receivedMessage: {
        backgroundColor: "#E8F5E9",
        padding: 10,
        borderRadius: 15,
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: "#888",
    },
    sentIcon: {
        marginLeft: 10,
    },
    receivedIcon: {
        marginRight: 10,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        padding: 10,
        backgroundColor: "#F8F8F8",
    },
    messageInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    sendButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 20,
        padding: 10,
    },
    disabledButton: {
        backgroundColor: "#999",
    },
    icon: {
        width: 20,
        height: 20,
    },
});
