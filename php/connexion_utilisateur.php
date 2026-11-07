<?php

// ======================================================
// TOYCYCLE - CONNEXION UTILISATEUR
// ======================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "connexion.php";


// ======================================================
// VÉRIFIER LA MÉTHODE
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ]);

    exit;
}


// ======================================================
// RÉCUPÉRER LES DONNÉES ENVOYÉES PAR JAVASCRIPT
// ======================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);


// ======================================================
// VÉRIFIER LES DONNÉES
// ======================================================

if (!$data) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Données invalides."
    ]);

    exit;
}


// ======================================================
// RÉCUPÉRER EMAIL ET MOT DE PASSE
// ======================================================

$email =
    trim($data["email"] ?? "");

$password =
    $data["password"] ?? "";


// ======================================================
// VÉRIFIER QUE LES CHAMPS NE SONT PAS VIDES
// ======================================================

if ($email === "" || $password === "") {

    echo json_encode([
        "success" => false,
        "message" => "Veuillez remplir tous les champs."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER L'EMAIL
// ======================================================

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Adresse email invalide."
    ]);

    exit;
}


// ======================================================
// RECHERCHER L'UTILISATEUR DANS MYSQL
// ======================================================

$sql = "
    SELECT
        id_utilisateur,
        nom,
        prenom,
        email,
        mot_de_passe,
        telephone,
        ville,
        photo_profil,
        date_inscription
    FROM utilisateur
    WHERE email = :email
    LIMIT 1
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    "email" => $email
]);

$utilisateur = $stmt->fetch();


// ======================================================
// UTILISATEUR INTROUVABLE
// ======================================================

if (!$utilisateur) {

    echo json_encode([
        "success" => false,
        "message" => "Email ou mot de passe incorrect."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER LE MOT DE PASSE
// ======================================================

if (
    !password_verify(
        $password,
        $utilisateur["mot_de_passe"]
    )
) {

    echo json_encode([
        "success" => false,
        "message" => "Email ou mot de passe incorrect."
    ]);

    exit;
}


// ======================================================
// CRÉER LA SESSION
// ======================================================

$_SESSION["id_utilisateur"] =
    $utilisateur["id_utilisateur"];

$_SESSION["email"] =
    $utilisateur["email"];


// ======================================================
// NE JAMAIS ENVOYER LE MOT DE PASSE
// ======================================================

unset(
    $utilisateur["mot_de_passe"]
);


// ======================================================
// RÉPONSE À JAVASCRIPT
// ======================================================

echo json_encode([

    "success" => true,

    "message" => "Connexion réussie !",

    "utilisateur" => $utilisateur

]);

?>