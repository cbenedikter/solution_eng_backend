// === React Native Example ===
import { Platform } from "react-native"

const sendDataToServer = async (keyValueData) => {
  try {
    const response = await fetch("https://your-website.vercel.app/api/mobile/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keyValueData),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Data sent successfully:", result)
    } else {
      console.error("Server error:", result.error)
    }
  } catch (error) {
    console.error("Network error:", error)
  }
}

// Usage in React Native:
const handleSendData = () => {
  const dataToSend = {
    userId: "12345",
    deviceType: Platform.OS, // 'ios' or 'android'
    appVersion: "1.0.0",
    timestamp: new Date().toISOString(),
    customField: "your custom value",
  }

  sendDataToServer(dataToSend)
}

// === Flutter/Dart Example ===
/*
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> sendDataToServer(Map<String, String> keyValueData) async {
  try {
    final response = await http.post(
      Uri.parse('https://your-website.vercel.app/api/mobile/data'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(keyValueData),
    );

    if (response.statusCode == 200) {
      final result = jsonDecode(response.body);
      print('Data sent successfully: $result');
    } else {
      print('Server error: ${response.body}');
    }
  } catch (error) {
    print('Network error: $error');
  }
}

// Usage in Flutter:
void handleSendData() {
  final dataToSend = {
    'userId': '12345',
    'deviceType': 'mobile',
    'appVersion': '1.0.0',
    'timestamp': DateTime.now().toIso8601String(),
    'customField': 'your custom value'
  };
  
  sendDataToServer(dataToSend);
}
*/

// === Swift/iOS Example ===
/*
func sendDataToServer(keyValueData: [String: String]) {
    guard let url = URL(string: "https://your-website.vercel.app/api/mobile/data") else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    do {
        let jsonData = try JSONSerialization.data(withJSONObject: keyValueData)
        request.httpBody = jsonData
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Network error: \(error)")
                return
            }
            
            if let data = data {
                do {
                    let result = try JSONSerialization.jsonObject(with: data)
                    print("Data sent successfully: \(result)")
                } catch {
                    print("JSON parsing error: \(error)")
                }
            }
        }.resume()
        
    } catch {
        print("JSON encoding error: \(error)")
    }
}

// Usage in Swift:
let dataToSend = [
    "userId": "12345",
    "deviceType": "iOS",
    "appVersion": "1.0.0",
    "timestamp": ISO8601DateFormatter().string(from: Date()),
    "customField": "your custom value"
]

sendDataToServer(keyValueData: dataToSend)
*/
