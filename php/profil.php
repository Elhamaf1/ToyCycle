<?php

// ======================================================
// TOYCYCLE - PROFIL UTILISATEUR
// GET    → récupérer le profil
// POST   → modifier le profil
// DELETE → supprimer le compte
// ======================================================
header("Content-Type: application/json; charset=UTF-8");
session_start();
require_once "connexion.php";

// ======================================================
// VÉRIFIER LA CONNEXION
// ======================================================
if (!isset($_SESSION["id_utilisateur"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Vous devez être connecté."
    ]);
    exit;
}
$idUtilisateur = (int) $_SESSION["id_utilisateur"];


// ======================================================
// RÉCUPÉRER LA MÉTHODE
// ======================================================

$method = $_SERVER["REQUEST_METHOD"];


// ======================================================
// GET : RÉCUPÉRER LE PROFIL
// ======================================================

if ($method === "GET") {

    $sql = "
        SELECT
            id_utilisateur,
            nom,
            prenom,
            email,
            telephone,
            ville,
            photo_profil,
            date_inscription,
            derniere_connexion,
            statut_compte
        FROM utilisateur
        WHERE id_utilisateur = :id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id" => $idUtilisateur
    ]);

    $utilisateur = $stmt->fetch();


    // --------------------------------------------------
    // UTILISATEUR INTROUVABLE
    // --------------------------------------------------

    if (!$utilisateur) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Utilisateur introuvable."
        ]);

        exit;
    }


    // --------------------------------------------------
    // VÉRIFIER LE STATUT
    // --------------------------------------------------

    if ($utilisateur["statut_compte"] !== "actif") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Ce compte n'est plus actif."
        ]);

        exit;
    }


    // --------------------------------------------------
    // NE PAS ENVOYER D'INFORMATIONS INUTILES
    // --------------------------------------------------

    unset($utilisateur["statut_compte"]);


    // --------------------------------------------------
    // RÉPONSE
    // --------------------------------------------------

    echo json_encode([
        "success" => true,
        "utilisateur" => $utilisateur
    ]);

    exit;
}


// ======================================================
// POST : MODIFIER LE PROFIL
// ======================================================

if ($method === "POST") {

    // --------------------------------------------------
    // RÉCUPÉRER LES DONNÉES
    // --------------------------------------------------
    $nom =
        trim($_POST["nom"] ?? "");

    $prenom =
        trim($_POST["prenom"] ?? "");

    $email =
        trim($_POST["email"] ?? "");

    $ville =
        trim($_POST["ville"] ?? "");

    $telephone =
        trim($_POST["telephone"] ?? "");


    // --------------------------------------------------
    // VÉRIFIER LES CHAMPS
    // --------------------------------------------------

    if (
        $nom === "" ||
        $prenom === "" ||
        $email === "" ||
        $ville === "" ||
        $telephone === ""
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Veuillez remplir tous les champs."
        ]);

        exit;
    }


    // --------------------------------------------------
    // VÉRIFIER L'EMAIL
    // --------------------------------------------------

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Adresse email invalide."
        ]);

        exit;
    }


    // --------------------------------------------------
    // VÉRIFIER LE TÉLÉPHONE
    // --------------------------------------------------

    if (!preg_match("/^0[5-7][0-9]{8}$/", $telephone)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Numéro de téléphone invalide."
        ]);

        exit;
    }


    // --------------------------------------------------
    // VÉRIFIER SI L'EMAIL EST UTILISÉ
    // PAR UN AUTRE UTILISATEUR
    // --------------------------------------------------

    $sql = "
        SELECT id_utilisateur
        FROM utilisateur
        WHERE email = :email
        AND id_utilisateur != :id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":email" => $email,
        ":id" => $idUtilisateur
    ]);


    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Cette adresse email est déjà utilisée."
        ]);

        exit;
    }


    // --------------------------------------------------
    // VÉRIFIER SI LE TÉLÉPHONE EST UTILISÉ
    // PAR UN AUTRE UTILISATEUR
    // --------------------------------------------------

    $sql = "
        SELECT id_utilisateur
        FROM utilisateur
        WHERE telephone = :telephone
        AND id_utilisateur != :id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":telephone" => $telephone,
        ":id" => $idUtilisateur
    ]);


    if ($stmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "Ce numéro de téléphone est déjà utilisé."
        ]);

        exit;
    }


    // ==================================================
    // PHOTO DE PROFIL
    // ==================================================

    $photo_profil = null;

    if (
        isset($_FILES["photo"]) &&
        $_FILES["photo"]["error"] === UPLOAD_ERR_OK
    ) {

        // Types autorisés
        $typesAutorises = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !in_array(
                $_FILES["photo"]["type"],
                $typesAutorises
            )
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Format d'image non autorisé."
            ]);

            exit;
        }


        // Taille maximale : 5 Mo
        if (
            $_FILES["photo"]["size"] >
            5 * 1024 * 1024
        ) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" =>
                    "La photo ne doit pas dépasser 5 Mo."
            ]);

            exit;
        }


        // Dossier des photos
        $dossier =
            "../uploads/profils/";


        // Créer le dossier s'il n'existe pas
        if (!is_dir($dossier)) {

            mkdir(
                $dossier,
                0777,
                true
            );
        }


        // Extension
        $extension =
            strtolower(
                pathinfo(
                    $_FILES["photo"]["name"],
                    PATHINFO_EXTENSION
                )
            );


        // Nom unique
        $nomFichier =
            "profil_" .
            $idUtilisateur .
            "_" .
            time() .
            "." .
            $extension;


        // Chemin physique
        $chemin =
            $dossier . $nomFichier;


        // Déplacer l'image
        if (
            !move_uploaded_file(
                $_FILES["photo"]["tmp_name"],
                $chemin
            )
        ) {

            http_response_code(500);

            echo json_encode([
                "success" => false,
                "message" =>
                    "Impossible d'enregistrer la photo."
            ]);

            exit;
        }


        // Chemin enregistré dans MySQL
        $photo_profil =
            "uploads/profils/" . $nomFichier;
    }


    // --------------------------------------------------
    // MODIFIER L'UTILISATEUR (une seule fois)
    // --------------------------------------------------

    if ($photo_profil !== null) {

        // Nouvelle photo sélectionnée
        $sql = "
            UPDATE utilisateur
            SET
                nom = :nom,
                prenom = :prenom,
                email = :email,
                telephone = :telephone,
                ville = :ville,
                photo_profil = :photo_profil
            WHERE id_utilisateur = :id
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":nom" => $nom,
            ":prenom" => $prenom,
            ":email" => $email,
            ":telephone" => $telephone,
            ":ville" => $ville,
            ":photo_profil" => $photo_profil,
            ":id" => $idUtilisateur
        ]);

    } else {

        // Pas de nouvelle photo
        $sql = "
            UPDATE utilisateur
            SET
                nom = :nom,
                prenom = :prenom,
                email = :email,
                telephone = :telephone,
                ville = :ville
            WHERE id_utilisateur = :id
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":nom" => $nom,
            ":prenom" => $prenom,
            ":email" => $email,
            ":telephone" => $telephone,
            ":ville" => $ville,
            ":id" => $idUtilisateur
        ]);
    }


    // --------------------------------------------------
    // METTRE À JOUR L'EMAIL DE SESSION
    // --------------------------------------------------

    $_SESSION["email"] = $email;


    // --------------------------------------------------
    // RÉPONSE
    // --------------------------------------------------

    echo json_encode([
        "success" => true,
        "message" => "Profil modifié avec succès."
    ]);

    exit;
}


// ======================================================
// DELETE : SUPPRIMER LE COMPTE
// ======================================================

if ($method === "DELETE") {

    try {

        // --------------------------------------------------
        // TRANSACTION
        // --------------------------------------------------

        $pdo->beginTransaction();


        // --------------------------------------------------
        // SUPPRIMER L'UTILISATEUR
        // --------------------------------------------------
        // Grâce à ON DELETE CASCADE dans ta base :
        //
        // utilisateur
        //      ↓
        // annonces
        //      ↓
        // photos
        //
        // Les relations concernées seront supprimées
        // automatiquement.
        // --------------------------------------------------

        $sql = "
            DELETE FROM utilisateur
            WHERE id_utilisateur = :id
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":id" => $idUtilisateur
        ]);


        // --------------------------------------------------
        // VÉRIFIER LA SUPPRESSION
        // --------------------------------------------------

        if ($stmt->rowCount() === 0) {

            $pdo->rollBack();

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Utilisateur introuvable."
            ]);

            exit;
        }


        // --------------------------------------------------
        // VALIDER
        // --------------------------------------------------

        $pdo->commit();


        // --------------------------------------------------
        // DÉTRUIRE LA SESSION
        // --------------------------------------------------

        $_SESSION = [];


        if (ini_get("session.use_cookies")) {

            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                "",
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }


        session_destroy();


        // --------------------------------------------------
        // RÉPONSE
        // --------------------------------------------------

        echo json_encode([
            "success" => true,
            "message" => "Votre compte et vos annonces ont été supprimés."
        ]);

        exit;

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Impossible de supprimer le compte."
        ]);

        exit;
    }
}


// ======================================================
// MÉTHODE NON AUTORISÉE
// ======================================================

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Méthode non autorisée."
]);