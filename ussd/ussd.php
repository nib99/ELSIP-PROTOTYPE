<?php
// Simple USSD handler example for Africa's Talking or similar gateways
$text = $_POST['text'] ?? '';
$phoneNumber = $_POST['phoneNumber'] ?? '';
if ($text == '') {
    $response = "CON 1. ሥራ ፍለጋ\n2. Skills ID\n3. AI አማካሪ";
} elseif ($text == '1') {
    $response = "CON ቦታ አድርግ: 1. Addis 2. Local";
} elseif ($text == '2') {
    $qr = file_get_contents('https://api.elsip.example/skills-id?phone='.urlencode($phoneNumber));
    $response = "END የSkills ID አቅርቧል!";
} else {
    $response = "END አልተረዳሁም";
}
header('Content-type: text/plain');
echo $response;
?>
