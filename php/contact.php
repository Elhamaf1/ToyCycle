<?php

// ======================================================
// TOYCYCLE - CONTACT
// Enregistrement des messages dans MySQL
// ======================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "connexion.php";


// ======================================================
// 1. VÉRIFIER LA MÉTHODE
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ]);

    exit;
}


// ======================================================
// 2. RÉCUPÉRER LES DONNÉES JSON
// ======================================================

$donnees = json_decode(
    file_get_contents("php://input"),
    true
);

if (!$donnees) {

    echo json_encode([
        "success" => false,
        "message" => "Données invalides."
    ]);

    exit;
}


// ======================================================
// 3. RÉCUPÉRER LES CHAMPS
// ======================================================

$prenom = trim($donnees["prenom"] ?? "");
$nom = trim($donnees["nom"] ?? "");
$email = trim($donnees["email"] ?? "");
$sujet = trim($donnees["sujet"] ?? "");
$message = trim($donnees["message"] ?? "");


// ======================================================
// 4. VÉRIFIER LES CHAMPS
// ======================================================

if (
    $prenom === "" ||
    $nom === "" ||
    $email === "" ||
    $sujet === "" ||
    $message === ""
) {

    echo json_encode([
        "success" => false,
        "message" => "Tous les champs sont obligatoires."
    ]);

    exit;
}


// ======================================================
// 5. VÉRIFIER L'EMAIL
// ======================================================

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Adresse e-mail invalide."
    ]);

    exit;
}


// ======================================================
// 6. VÉRIFIER LA LONGUEUR DU MESSAGE
// ======================================================

if (strlen($message) < 10) {

    echo json_encode([
        "success" => false,
        "message" => "Le message doit contenir au moins 10 caractères."
    ]);

    exit;
}

if (strlen($message) > 1000) {

    echo json_encode([
        "success" => false,
        "message" => "Le message ne doit pas dépasser 1000 caractères."
    ]);

    exit;
}


// ======================================================
// 7. UTILISATEUR CONNECTÉ
// ======================================================

$id_utilisateur = null;

if (isset($_SESSION["id_utilisateur"])) {

    $id_utilisateur = $_SESSION["id_utilisateur"];
}


// ======================================================
// 8. ENREGISTRER DANS MYSQL
// ======================================================

try {

    $sql = "
        INSERT INTO contact
        (
            prenom,
            nom,
            email,
            sujet,
            message,
            id_utilisateur
        )
        VALUES
        (
            :prenom,
            :nom,
            :email,
            :sujet,
            :message,
            :id_utilisateur
        )
    ";

    $requete = $pdo->prepare($sql);

    $requete->execute([
        ":prenom" => $prenom,
        ":nom" => $nom,
        ":email" => $email,
        ":sujet" => $sujet,
        ":message" => $message,
        ":id_utilisateur" => $id_utilisateur
    ]);


    // ==================================================
    // 9. SUCCÈS
    // ==================================================

    echo json_encode([
        "success" => true,
        "message" => "Votre message a été envoyé avec succès !"
    ]);

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de l'enregistrement du message."
    ]);

}

?>