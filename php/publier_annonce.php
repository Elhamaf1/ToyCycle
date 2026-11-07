<?php

// ======================================================
// TOYCYCLE - PUBLIER UNE ANNONCE
//
// POST
// → créer une annonce
//
// L'utilisateur vient de la SESSION.
// Le téléphone vient de utilisateur.telephone.
// Le téléphone n'est PAS envoyé par JavaScript.
// Le téléphone n'est PAS enregistré dans annonce.
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
// VÉRIFIER LA SESSION
// ======================================================

if (!isset($_SESSION["id_utilisateur"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" =>
            "Vous devez être connecté pour publier une annonce."
    ]);

    exit;
}


$idUtilisateur =
    (int) $_SESSION["id_utilisateur"];


// ======================================================
// RÉCUPÉRER LE PROFIL
// ======================================================

$stmt = $pdo->prepare("
    SELECT
        id_utilisateur,
        telephone,
        statut_compte
    FROM utilisateur
    WHERE id_utilisateur = :id
    LIMIT 1
");

$stmt->execute([
    ":id" => $idUtilisateur
]);

$utilisateur =
    $stmt->fetch(PDO::FETCH_ASSOC);


// ======================================================
// UTILISATEUR INTROUVABLE
// ======================================================

if (!$utilisateur) {

    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "Utilisateur introuvable."
    ]);

    exit;
}


// ======================================================
// VÉRIFIER LE STATUT
// ======================================================

if ($utilisateur["statut_compte"] !== "actif") {

    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" =>
            "Votre compte n'est pas actif."
    ]);

    exit;
}


// ======================================================
// TÉLÉPHONE DU PROFIL
//
// IMPORTANT :
// Il vient directement de MySQL.
//
// $_POST["telephone"] n'est jamais utilisé.
// ======================================================

$telephone =
    trim($utilisateur["telephone"] ?? "");


// ======================================================
// VÉRIFIER LE TÉLÉPHONE
// ======================================================

if ($telephone === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Veuillez renseigner votre numéro de téléphone dans votre profil avant de publier une annonce."
    ]);

    exit;
}


// ======================================================
// RÉCUPÉRER LES DONNÉES
// ======================================================

$titre =
    trim($_POST["titre"] ?? "");

$description =
    trim($_POST["description"] ?? "");

$ville =
    trim($_POST["ville"] ?? "");

$idCategorie =
    (int)($_POST["categorie"] ?? 0);

$idAge =
    (int)($_POST["age"] ?? 0);

$idType =
    (int)($_POST["mode"] ?? 0);

$idEtat =
    (int)($_POST["etat"] ?? 0);

$prix =
    $_POST["prix"] ?? "";


// ======================================================
// VALIDATION TITRE
// ======================================================

if ($titre === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Le titre est obligatoire."
    ]);

    exit;
}


if (mb_strlen($titre) < 3) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Le titre doit contenir au moins 3 caractères."
    ]);

    exit;
}


// ======================================================
// VALIDATION DESCRIPTION
// ======================================================

if ($description === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "La description est obligatoire."
    ]);

    exit;
}


if (mb_strlen($description) < 10) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "La description doit contenir au moins 10 caractères."
    ]);

    exit;
}


if (mb_strlen($description) > 500) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "La description ne doit pas dépasser 500 caractères."
    ]);

    exit;
}


// ======================================================
// VALIDATION VILLE
// ======================================================

if ($ville === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "La ville est obligatoire."
    ]);

    exit;
}


// ======================================================
// CATÉGORIE
// ======================================================

if ($idCategorie <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Veuillez sélectionner une catégorie."
    ]);

    exit;
}


$stmt = $pdo->prepare("
    SELECT id_categorie
    FROM categorie
    WHERE id_categorie = :id
    AND statut = 'active'
    LIMIT 1
");

$stmt->execute([
    ":id" => $idCategorie
]);


if (!$stmt->fetch()) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Catégorie invalide."
    ]);

    exit;
}


// ======================================================
// ÂGE
// ======================================================

if ($idAge <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Veuillez sélectionner l'âge recommandé."
    ]);

    exit;
}


$stmt = $pdo->prepare("
    SELECT id_age
    FROM tranche_age
    WHERE id_age = :id
    LIMIT 1
");

$stmt->execute([
    ":id" => $idAge
]);


if (!$stmt->fetch()) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Tranche d'âge invalide."
    ]);

    exit;
}


// ======================================================
// TYPE
//
// 1 = Vente
// 2 = Échange
// ======================================================

if (
    $idType !== 1 &&
    $idType !== 2
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Mode de transaction invalide."
    ]);

    exit;
}


$stmt = $pdo->prepare("
    SELECT
        id_type,
        nom_type
    FROM type_annonce
    WHERE id_type = :id
    LIMIT 1
");

$stmt->execute([
    ":id" => $idType
]);

$type =
    $stmt->fetch(PDO::FETCH_ASSOC);


if (!$type) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Mode de transaction invalide."
    ]);

    exit;
}


// ======================================================
// ÉTAT
// ======================================================

if ($idEtat <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Veuillez sélectionner l'état du jouet."
    ]);

    exit;
}


$stmt = $pdo->prepare("
    SELECT id_etat
    FROM etat_jouet
    WHERE id_etat = :id
    LIMIT 1
");

$stmt->execute([
    ":id" => $idEtat
]);


if (!$stmt->fetch()) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "État du jouet invalide."
    ]);

    exit;
}


// ======================================================
// PRIX
// ======================================================

if ($idType === 1) {

    if (
        $prix === "" ||
        !is_numeric($prix)
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Veuillez indiquer le prix du jouet."
        ]);

        exit;
    }


    $prix = (float)$prix;


    if ($prix <= 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" =>
                "Le prix doit être supérieur à 0 DH."
        ]);

        exit;
    }

} else {

    // Échange
    $prix = null;
}


// ======================================================
// STATUT = DISPONIBLE
//
// Les IDs peuvent être :
// 1, 2, 4, 5, 6
//
// On recherche donc par nom.
// ======================================================

$stmt = $pdo->prepare("
    SELECT id_statut
    FROM statut_annonce
    WHERE nom_statut = 'Disponible'
    LIMIT 1
");

$stmt->execute();

$idStatut =
    $stmt->fetchColumn();


if (!$idStatut) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Le statut Disponible n'existe pas dans la base de données."
    ]);

    exit;
}


// ======================================================
// IMAGES
// ======================================================

if (
    !isset($_FILES["images"]) ||
    empty($_FILES["images"]["name"][0])
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Veuillez ajouter au moins une image."
    ]);

    exit;
}


$nombreImages =
    count($_FILES["images"]["name"]);


if ($nombreImages > 5) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" =>
            "Vous pouvez ajouter au maximum 5 images."
    ]);

    exit;
}


// ======================================================
// DOSSIER UPLOAD
// ======================================================

$dossier =
    dirname(__DIR__) .
    "/uploads/annonces/";


if (!is_dir($dossier)) {

    if (!mkdir($dossier, 0777, true)) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" =>
                "Impossible de créer le dossier des images."
        ]);

        exit;
    }
}


// ======================================================
// TRANSACTION MYSQL
// ======================================================

try {

    $pdo->beginTransaction();


    // ==================================================
    // INSERTION ANNONCE
    // ==================================================

    $sql = "
        INSERT INTO annonce (
            titre,
            description,
            prix,
            ville,
            id_utilisateur,
            id_categorie,
            id_age,
            id_type,
            id_etat,
            id_statut
        )
        VALUES (
            :titre,
            :description,
            :prix,
            :ville,
            :id_utilisateur,
            :id_categorie,
            :id_age,
            :id_type,
            :id_etat,
            :id_statut
        )
    ";


    $stmt =
        $pdo->prepare($sql);


    $stmt->execute([

        ":titre" =>
            $titre,

        ":description" =>
            $description,

        ":prix" =>
            $prix,

        ":ville" =>
            $ville,

        ":id_utilisateur" =>
            $idUtilisateur,

        ":id_categorie" =>
            $idCategorie,

        ":id_age" =>
            $idAge,

        ":id_type" =>
            $idType,

        ":id_etat" =>
            $idEtat,

        ":id_statut" =>
            $idStatut
    ]);


    // ==================================================
    // ID ANNONCE
    // ==================================================

    $idAnnonce =
        (int)$pdo->lastInsertId();


    // ==================================================
    // TYPES D'IMAGES AUTORISÉS
    // ==================================================

    $typesAutorises = [

        "image/jpeg" => "jpg",

        "image/png" => "png",

        "image/webp" => "webp"
    ];


    $finfo =
        finfo_open(FILEINFO_MIME_TYPE);


    $photosEnregistrees = 0;


    // ==================================================
    // ENREGISTRER LES IMAGES
    // ==================================================

    for (
        $i = 0;
        $i < $nombreImages;
        $i++
    ) {

        if (
            $_FILES["images"]["error"][$i]
            !== UPLOAD_ERR_OK
        ) {

            throw new Exception(
                "Erreur lors de l'envoi d'une image."
            );
        }


        $tmpName =
            $_FILES["images"]["tmp_name"][$i];


        $taille =
            $_FILES["images"]["size"][$i];


        // ----------------------------------------------
        // TAILLE MAX
        // ----------------------------------------------

        if (
            $taille >
            5 * 1024 * 1024
        ) {

            throw new Exception(
                "Une image dépasse 5 Mo."
            );
        }


        // ----------------------------------------------
        // TYPE RÉEL
        // ----------------------------------------------

        $mime =
            finfo_file(
                $finfo,
                $tmpName
            );


        if (
            !isset(
                $typesAutorises[$mime]
            )
        ) {

            throw new Exception(
                "Format d'image non autorisé."
            );
        }


        $extension =
            $typesAutorises[$mime];


        // ----------------------------------------------
        // NOM UNIQUE
        // ----------------------------------------------

        $nomFichier =
            uniqid(
                "annonce_",
                true
            )
            . "."
            . $extension;


        $cheminComplet =
            $dossier .
            $nomFichier;


        // ----------------------------------------------
        // DÉPLACER
        // ----------------------------------------------

        if (
            !move_uploaded_file(
                $tmpName,
                $cheminComplet
            )
        ) {

            throw new Exception(
                "Impossible d'enregistrer une image."
            );
        }


        // ----------------------------------------------
        // CHEMIN MYSQL
        // ----------------------------------------------

        $cheminBDD =
            "uploads/annonces/" .
            $nomFichier;


        $nomOriginal =
            basename(
                $_FILES["images"]["name"][$i]
            );


        $ordre =
            $i + 1;


        $principale =
            ($i === 0)
                ? 1
                : 0;


        // ----------------------------------------------
        // INSERT PHOTO
        // ----------------------------------------------

        $stmtPhoto =
            $pdo->prepare("
                INSERT INTO photo (
                    chemin_photo,
                    nom_original,
                    ordre_affichage,
                    est_principale,
                    id_annonce
                )
                VALUES (
                    :chemin,
                    :nom_original,
                    :ordre,
                    :principale,
                    :id_annonce
                )
            ");


        $stmtPhoto->execute([

            ":chemin" =>
                $cheminBDD,

            ":nom_original" =>
                $nomOriginal,

            ":ordre" =>
                $ordre,

            ":principale" =>
                $principale,

            ":id_annonce" =>
                $idAnnonce
        ]);


        $photosEnregistrees++;
    }


    finfo_close($finfo);


    // ==================================================
    // COMMIT
    // ==================================================

    $pdo->commit();


    // ==================================================
    // RÉPONSE
    // ==================================================

    echo json_encode([

        "success" => true,

        "message" =>
            "Votre annonce a été publiée avec succès.",

        "id_annonce" =>
            $idAnnonce,

        "photos" =>
            $photosEnregistrees

    ]);

    exit;


} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Impossible de publier l'annonce.",
        "error" =>
            $e->getMessage()
    ]);
    exit;
}
?>