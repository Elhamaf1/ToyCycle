<?php

// ======================================================
// TOYCYCLE - MOT DE PASSE OUBLIE
// Envoi du code avec PHPMailer + Gmail
// ======================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "connexion.php";
require_once "../vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


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
// RECUPERER JSON
// ======================================================

$input = file_get_contents("php://input");

$data = json_decode($input, true);

if (!is_array($data)) {

    echo json_encode([
        "success" => false,
        "message" => "Données JSON invalides."
    ]);

    exit;
}


$email = trim($data["email"] ?? "");


// ======================================================
// VERIFIER EMAIL
// ======================================================

if ($email === "") {

    echo json_encode([
        "success" => false,
        "message" => "Veuillez saisir votre adresse email."
    ]);

    exit;
}


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    echo json_encode([
        "success" => false,
        "message" => "Adresse email invalide."
    ]);

    exit;
}


// ======================================================
// RECHERCHER UTILISATEUR
// ======================================================

try {

    $sql = "
        SELECT
            id_utilisateur,
            nom,
            prenom,
            email
        FROM utilisateur
        WHERE email = :email
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":email" => $email
    ]);

    $utilisateur = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$utilisateur) {

        echo json_encode([
            "success" => false,
            "message" => "Aucun compte ne correspond à cette adresse email."
        ]);

        exit;
    }


    // ==================================================
    // GENERER CODE
    // ==================================================

    $code = (string) random_int(100000, 999999);


    // ==================================================
    // STOCKER SESSION
    // ==================================================

    $_SESSION["reset_email"] = $email;

    $_SESSION["reset_code"] = $code;

    $_SESSION["reset_expiration"] = time() + 600;


    // ==================================================
    // PHPMailer
    // ==================================================

    $mail = new PHPMailer(true);


    // ==================================================
    // SMTP GMAIL
    // ==================================================

    $mail->isSMTP();

    $mail->Host = "smtp.gmail.com";

    $mail->SMTPAuth = true;

    $mail->Username = "toycycletoy@gmail.com";

    // IMPORTANT :
    // Mets ici ton NOUVEAU mot de passe d'application Google.
    // Pas le mot de passe normal de Gmail.
    $mail->Password = "vzgd mxcz qieb spzk";

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->Port = 587;


    // ==================================================
    // ENCODAGE
    // ==================================================

    $mail->CharSet = "UTF-8";


    // ==================================================
    // EXPEDITEUR
    // ==================================================

    $mail->setFrom(
        "toycycletoy@gmail.com",
        "ToyCycle"
    );


    // ==================================================
    // DESTINATAIRE
    // ==================================================

    $mail->addAddress(
        $utilisateur["email"],
        $utilisateur["prenom"]
    );


    // ==================================================
    // EMAIL
    // ==================================================

    $mail->isHTML(true);

    $mail->Subject = "ToyCycle - Code de vérification";


    $prenom = htmlspecialchars(
        $utilisateur["prenom"],
        ENT_QUOTES,
        "UTF-8"
    );


    $mail->Body = "
        <div style='
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:auto;
            padding:30px;
            background:#ffffff;
            border:1px solid #eeeeee;
            border-radius:15px;
        '>

            <h1 style='
                text-align:center;
                color:#F9AFAF;
            '>
                ToyCycle
            </h1>

            <h2>
                Bonjour {$prenom} 👋
            </h2>

            <p>
                Vous avez demandé la réinitialisation
                de votre mot de passe ToyCycle.
            </p>

            <p>
                Votre code de vérification est :
            </p>

            <div style='
                text-align:center;
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
                padding:20px;
                margin:25px 0;
                background:#FFF8F1;
                border-radius:12px;
            '>
                {$code}
            </div>

            <p>
                Ce code est valable pendant
                <strong>10 minutes</strong>.
            </p>

            <p>
                Si vous n'avez pas demandé cette
                réinitialisation, ignorez cet email.
            </p>

            <hr>

            <p style='
                text-align:center;
                color:#888;
                font-size:13px;
            '>
                ToyCycle - Donnez une seconde vie aux jouets.
            </p>

        </div>
    ";


    $mail->AltBody =
        "ToyCycle\n\n" .
        "Bonjour {$utilisateur["prenom"]},\n\n" .
        "Votre code de vérification est : {$code}\n\n" .
        "Ce code est valable pendant 10 minutes.";


    // ==================================================
    // ENVOYER
    // ==================================================

    $mail->send();


    // ==================================================
    // SUCCESS
    // ==================================================

    echo json_encode([
        "success" => true,
        "message" => "Le code de vérification a été envoyé à votre adresse email."
    ]);

    exit;


} catch (Exception $e) {

    // Supprimer la session
    unset($_SESSION["reset_email"]);
    unset($_SESSION["reset_code"]);
    unset($_SESSION["reset_expiration"]);


    echo json_encode([
        "success" => false,
        "message" => "Erreur PHPMailer : " . $e->getMessage()
    ]);

    exit;


} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => "Erreur de base de données : " . $e->getMessage()
    ]);

    exit;
}
?>