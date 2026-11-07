<?php

// ======================================================
// TOYCYCLE - VERIFICATION DU CODE
// Réinitialisation du mot de passe
// ======================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "connexion.php";


// ======================================================
// VERIFIER LA METHODE
// ======================================================

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ]);

    exit;
}


// ======================================================
// RECUPERER LES DONNEES
// ======================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);


$email =
    trim($data["email"] ?? "");

$code =
    trim($data["code"] ?? "");

$nouveauMotDePasse =
    $data["nouveau_mot_de_passe"] ?? "";


// ======================================================
// VERIFIER LES DONNEES
// ======================================================

if (
    $email === "" ||
    $code === "" ||
    $nouveauMotDePasse === ""
) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Toutes les informations sont obligatoires."
    ]);

    exit;
}


// ======================================================
// VERIFIER LE FORMAT DU CODE
// ======================================================

if (!preg_match('/^\d{6}$/', $code)) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Le code doit contenir exactement 6 chiffres."
    ]);

    exit;
}


// ======================================================
// VERIFIER LE MOT DE PASSE
// ======================================================

if (strlen($nouveauMotDePasse) < 8) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Le mot de passe doit contenir au moins 8 caractères."
    ]);

    exit;
}


// ======================================================
// VERIFIER LA SESSION
// ======================================================

$resetEmail =
    $_SESSION["reset_email"] ?? null;

$resetCode =
    $_SESSION["reset_code"] ?? null;

$resetExpiration =
    $_SESSION["reset_expiration"] ?? null;


// ======================================================
// SESSION ABSENTE
// ======================================================

if (
    !$resetEmail ||
    !$resetCode ||
    !$resetExpiration
) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Votre session de récupération a expiré."
    ]);

    exit;
}


// ======================================================
// VERIFIER L'EMAIL
// ======================================================

if ($email !== $resetEmail) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Adresse email incorrecte."
    ]);

    exit;
}


// ======================================================
// VERIFIER L'EXPIRATION
// ======================================================

if (time() > $resetExpiration) {

    unset($_SESSION["reset_email"]);
    unset($_SESSION["reset_code"]);
    unset($_SESSION["reset_expiration"]);


    echo json_encode([
        "success" => false,
        "message" =>
            "Le code de vérification a expiré. Veuillez demander un nouveau code."
    ]);

    exit;
}


// ======================================================
// VERIFIER LE CODE
// ======================================================

if (!hash_equals(
    (string)$resetCode,
    (string)$code
)) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Le code de vérification est incorrect."
    ]);

    exit;
}


// ======================================================
// HASHER LE NOUVEAU MOT DE PASSE
// ======================================================

$motDePasseHash =
    password_hash(
        $nouveauMotDePasse,
        PASSWORD_DEFAULT
    );


// ======================================================
// MODIFIER LE MOT DE PASSE
// ======================================================

try {

    $sql = "
        UPDATE utilisateur
        SET mot_de_passe = :mot_de_passe
        WHERE email = :email
        LIMIT 1
    ";

    $stmt =
        $pdo->prepare($sql);


    $stmt->execute([

        ":mot_de_passe" =>
            $motDePasseHash,

        ":email" =>
            $email

    ]);


    // ==================================================
    // VERIFIER LA MODIFICATION
    // ==================================================

    if ($stmt->rowCount() === 0) {

        /*
         * rowCount peut être 0 si le nouveau hash
         * est considéré comme identique, mais dans
         * ce contexte le hash est normalement différent.
         */

        $check = $pdo->prepare("
            SELECT id_utilisateur
            FROM utilisateur
            WHERE email = :email
            LIMIT 1
        ");

        $check->execute([
            ":email" => $email
        ]);

        if (!$check->fetch()) {

            echo json_encode([
                "success" => false,
                "message" =>
                    "Utilisateur introuvable."
            ]);

            exit;
        }
    }


    // ==================================================
    // SUPPRIMER LE CODE DE SESSION
    // ==================================================

    unset($_SESSION["reset_email"]);
    unset($_SESSION["reset_code"]);
    unset($_SESSION["reset_expiration"]);


    // ==================================================
    // SUCCESS
    // ==================================================

    echo json_encode([
        "success" => true,
        "message" =>
            "Votre mot de passe a été modifié avec succès."
    ]);

    exit;


} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" =>
            "Erreur lors de la modification du mot de passe."
    ]);

    exit;
}

?>