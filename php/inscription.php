<?php

// ======================================================
// TOYCYCLE - INSCRIPTION
// ======================================================

header("Content-Type: application/json; charset=UTF-8");

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

if (!$data) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Données invalides."
    ]);

    exit;
}


// ======================================================
// RÉCUPÉRER LES DONNÉES
// ======================================================

$nom = trim($data["nom"] ?? "");
$prenom = trim($data["prenom"] ?? "");
$email = trim($data["email"] ?? "");
$ville = trim($data["ville"] ?? "");
$telephone = trim($data["telephone"] ?? "");

$password = $data["password"] ?? "";
$confirmPassword = $data["confirmPassword"] ?? "";

$conditions = $data["conditions"] ?? false;


// ======================================================
// VÉRIFIER LES CHAMPS
// ======================================================

if (
    $nom === "" ||
    $prenom === "" ||
    $email === "" ||
    $ville === "" ||
    $telephone === "" ||
    $password === ""
) {

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
// VÉRIFIER LE TÉLÉPHONE
// ======================================================

if (!preg_match("/^0[5-7][0-9]{8}$/", $telephone)) {

    echo json_encode([
        "success" => false,
        "message" => "Numéro de téléphone invalide."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER LE MOT DE PASSE
// ======================================================

if ($password !== $confirmPassword) {

    echo json_encode([
        "success" => false,
        "message" => "Les mots de passe ne correspondent pas."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER LES CONDITIONS
// ======================================================

if (!$conditions) {

    echo json_encode([
        "success" => false,
        "message" => "Vous devez accepter les conditions d'utilisation."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER SI L'EMAIL EXISTE
// ======================================================

$sql = "
    SELECT id_utilisateur
    FROM utilisateur
    WHERE email = :email
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":email" => $email
]);

if ($stmt->fetch()) {

    echo json_encode([
        "success" => false,
        "message" => "Cette adresse email est déjà utilisée."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER SI LE TÉLÉPHONE EXISTE
// ======================================================

$sql = "
    SELECT id_utilisateur
    FROM utilisateur
    WHERE telephone = :telephone
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":telephone" => $telephone
]);

if ($stmt->fetch()) {

    echo json_encode([
        "success" => false,
        "message" => "Ce numéro de téléphone est déjà utilisé."
    ]);

    exit;
}


// ======================================================
// CRYPTER LE MOT DE PASSE
// ======================================================

$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);


// ======================================================
// INSÉRER L'UTILISATEUR
// ======================================================

$sql = "
    INSERT INTO utilisateur
    (
        nom,
        prenom,
        email,
        mot_de_passe,
        telephone,
        ville
    )
    VALUES
    (
        :nom,
        :prenom,
        :email,
        :mot_de_passe,
        :telephone,
        :ville
    )
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ":nom" => $nom,
    ":prenom" => $prenom,
    ":email" => $email,
    ":mot_de_passe" => $passwordHash,
    ":telephone" => $telephone,
    ":ville" => $ville
]);


// ======================================================
// SUCCÈS
// ======================================================

echo json_encode([
    "success" => true,
    "message" => "Compte créé avec succès !"
]);