<?php

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "connexion.php";


/* =========================================================
   1. VÉRIFIER LA CONNEXION
   ========================================================= */

if (!isset($_SESSION["id_utilisateur"])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Utilisateur non connecté."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$idUtilisateur = (int) $_SESSION["id_utilisateur"];


/* =========================================================
   2. RÉCUPÉRER L'ID DE L'ANNONCE
   ========================================================= */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $idAnnonce = isset($_GET["id_annonce"])
        ? (int) $_GET["id_annonce"]
        : 0;

} else {

    $idAnnonce = isset($_POST["id_annonce"])
        ? (int) $_POST["id_annonce"]
        : 0;
}


if ($idAnnonce <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "ID annonce invalide."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================================
   3. GET = RÉCUPÉRER LES VALEURS ACTUELLES
   ========================================================= */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    try {

        $sql = "
            SELECT
                a.id_annonce,
                a.titre,
                a.description,
                a.prix,
                a.ville,
                a.date_publication,

                c.nom_categorie AS categorie,

                ta.libelle AS age,

                t.nom_type AS mode,

                e.nom_etat AS etat,

                u.telephone

            FROM annonce a

            INNER JOIN utilisateur u
                ON a.id_utilisateur = u.id_utilisateur

            INNER JOIN categorie c
                ON a.id_categorie = c.id_categorie

            INNER JOIN tranche_age ta
                ON a.id_age = ta.id_age

            INNER JOIN type_annonce t
                ON a.id_type = t.id_type

            INNER JOIN etat_jouet e
                ON a.id_etat = e.id_etat

            WHERE
                a.id_annonce = :id_annonce
                AND a.id_utilisateur = :id_utilisateur

            LIMIT 1
        ";


        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ":id_annonce" => $idAnnonce,
            ":id_utilisateur" => $idUtilisateur
        ]);


        $annonce = $stmt->fetch(PDO::FETCH_ASSOC);


        if (!$annonce) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Annonce introuvable ou vous n'êtes pas autorisé."
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }


        /* =====================================================
           PHOTOS
           ===================================================== */

        $stmtPhotos = $pdo->prepare("
            SELECT
                id_photo,
                chemin_photo,
                nom_original,
                ordre_affichage,
                est_principale

            FROM photo

            WHERE id_annonce = :id_annonce

            ORDER BY ordre_affichage ASC
        ");

        $stmtPhotos->execute([
            ":id_annonce" => $idAnnonce
        ]);

        $photos = $stmtPhotos->fetchAll(PDO::FETCH_ASSOC);


        echo json_encode([
            "success" => true,
            "annonce" => $annonce,
            "photos" => $photos
        ], JSON_UNESCAPED_UNICODE);

        exit;


    } catch (PDOException $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Erreur lors de la récupération de l'annonce."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }
}


/* =========================================================
   4. VÉRIFIER POST
   ========================================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================================
   5. RÉCUPÉRER LES DONNÉES
   ========================================================= */

$titre = trim($_POST["titre"] ?? "");

$description = trim($_POST["description"] ?? "");

$ville = trim($_POST["ville"] ?? "");

$categorie = trim($_POST["categorie"] ?? "");

$mode = trim($_POST["mode"] ?? "");

$etat = trim($_POST["etat"] ?? "");

$age = trim($_POST["age"] ?? "");

$telephone = trim($_POST["telephone"] ?? "");

$prix = $_POST["prix"] ?? null;


/* =========================================================
   6. VALIDATION
   ========================================================= */

if (
    $titre === "" ||
    $description === "" ||
    $ville === "" ||
    $categorie === "" ||
    $mode === "" ||
    $etat === "" ||
    $age === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Tous les champs obligatoires doivent être remplis."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================================
   7. TÉLÉPHONE
   ========================================================= */

if (!preg_match("/^[0-9]{10}$/", $telephone)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Le numéro WhatsApp doit contenir exactement 10 chiffres."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================================
   8. MODE
   ========================================================= */

if ($mode !== "Vente" && $mode !== "Échange") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Mode de transaction invalide."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


/* =========================================================
   9. PRIX
   ========================================================= */

if ($mode === "Échange") {

    $prix = null;

} else {

    if (
        $prix === null ||
        $prix === "" ||
        !is_numeric($prix)
    ) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Veuillez saisir un prix valide."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    $prix = (float) $prix;

    if ($prix < 0) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Le prix ne peut pas être négatif."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }
}


/* =========================================================
   10. MODIFICATION
   ========================================================= */

try {

    $pdo->beginTransaction();


    /* =====================================================
       VÉRIFIER L'ANNONCE
       ===================================================== */

    $stmtCheck = $pdo->prepare("
        SELECT id_annonce
        FROM annonce
        WHERE id_annonce = :id_annonce
        AND id_utilisateur = :id_utilisateur
        LIMIT 1
    ");

    $stmtCheck->execute([
        ":id_annonce" => $idAnnonce,
        ":id_utilisateur" => $idUtilisateur
    ]);


    if (!$stmtCheck->fetch()) {

        $pdo->rollBack();

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Vous n'êtes pas autorisé à modifier cette annonce."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /* =====================================================
       CATÉGORIE
       ===================================================== */

    $stmtCategorie = $pdo->prepare("
        SELECT id_categorie
        FROM categorie
        WHERE nom_categorie = :nom
        LIMIT 1
    ");

    $stmtCategorie->execute([
        ":nom" => $categorie
    ]);

    $idCategorie = $stmtCategorie->fetchColumn();


    /* =====================================================
       AGE
       ===================================================== */

    $stmtAge = $pdo->prepare("
        SELECT id_age
        FROM tranche_age
        WHERE libelle = :libelle
        LIMIT 1
    ");

    $stmtAge->execute([
        ":libelle" => $age
    ]);

    $idAge = $stmtAge->fetchColumn();


    /* =====================================================
       TYPE
       ===================================================== */

    $stmtType = $pdo->prepare("
        SELECT id_type
        FROM type_annonce
        WHERE nom_type = :nom
        LIMIT 1
    ");

    $stmtType->execute([
        ":nom" => $mode
    ]);

    $idType = $stmtType->fetchColumn();


    /* =====================================================
       ÉTAT
       ===================================================== */

    $stmtEtat = $pdo->prepare("
        SELECT id_etat
        FROM etat_jouet
        WHERE nom_etat = :nom
        LIMIT 1
    ");

    $stmtEtat->execute([
        ":nom" => $etat
    ]);

    $idEtat = $stmtEtat->fetchColumn();


    if (
        !$idCategorie ||
        !$idAge ||
        !$idType ||
        !$idEtat
    ) {

        $pdo->rollBack();

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Une valeur sélectionnée est introuvable dans la base."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    /* =====================================================
       UPDATE ANNONCE
       ===================================================== */

    $sqlUpdate = "
        UPDATE annonce

        SET
            titre = :titre,
            description = :description,
            prix = :prix,
            ville = :ville,
            date_modification = NOW(),
            id_categorie = :id_categorie,
            id_age = :id_age,
            id_type = :id_type,
            id_etat = :id_etat

        WHERE
            id_annonce = :id_annonce
            AND id_utilisateur = :id_utilisateur
    ";


    $stmtUpdate = $pdo->prepare($sqlUpdate);


    $stmtUpdate->execute([
        ":titre" => $titre,
        ":description" => $description,
        ":prix" => $prix,
        ":ville" => $ville,
        ":id_categorie" => $idCategorie,
        ":id_age" => $idAge,
        ":id_type" => $idType,
        ":id_etat" => $idEtat,
        ":id_annonce" => $idAnnonce,
        ":id_utilisateur" => $idUtilisateur
    ]);


    /* =====================================================
       TÉLÉPHONE
       ===================================================== */

    $stmtTelephone = $pdo->prepare("
        UPDATE utilisateur

        SET telephone = :telephone

        WHERE id_utilisateur = :id_utilisateur
    ");


    $stmtTelephone->execute([
        ":telephone" => $telephone,
        ":id_utilisateur" => $idUtilisateur
    ]);


    /* =====================================================
       PHOTOS
       ===================================================== */

    if (
        isset($_FILES["images"]) &&
        isset($_FILES["images"]["name"]) &&
        is_array($_FILES["images"]["name"]) &&
        count($_FILES["images"]["name"]) > 0
    ) {

        $uploadDir = __DIR__ . "/../uploads/annonces/";


        if (!is_dir($uploadDir)) {

            mkdir(
                $uploadDir,
                0777,
                true
            );
        }


        /* Anciennes photos */

        $stmtOldPhotos = $pdo->prepare("
            SELECT chemin_photo
            FROM photo
            WHERE id_annonce = :id_annonce
        ");

        $stmtOldPhotos->execute([
            ":id_annonce" => $idAnnonce
        ]);

        $anciennesPhotos =
            $stmtOldPhotos->fetchAll(PDO::FETCH_ASSOC);


        foreach ($anciennesPhotos as $anciennePhoto) {

            $ancienChemin =
                __DIR__ . "/../" .
                $anciennePhoto["chemin_photo"];


            if (
                file_exists($ancienChemin) &&
                is_file($ancienChemin)
            ) {

                unlink($ancienChemin);
            }
        }


        /* Supprimer les anciennes lignes */

        $stmtDeletePhotos = $pdo->prepare("
            DELETE FROM photo
            WHERE id_annonce = :id_annonce
        ");

        $stmtDeletePhotos->execute([
            ":id_annonce" => $idAnnonce
        ]);


        $extensionsAutorisees = [
            "jpg",
            "jpeg",
            "png",
            "webp"
        ];


        $nombrePhotos =
            count($_FILES["images"]["name"]);


        for ($i = 0; $i < $nombrePhotos; $i++) {

            if (
                $_FILES["images"]["error"][$i]
                !== UPLOAD_ERR_OK
            ) {
                continue;
            }


            $tmpName =
                $_FILES["images"]["tmp_name"][$i];

            $originalName =
                $_FILES["images"]["name"][$i];


            $extension =
                strtolower(
                    pathinfo(
                        $originalName,
                        PATHINFO_EXTENSION
                    )
                );


            if (
                !in_array(
                    $extension,
                    $extensionsAutorisees,
                    true
                )
            ) {
                continue;
            }


            $nomFichier =
                uniqid(
                    "annonce_",
                    true
                ) .
                "." .
                $extension;


            $destination =
                $uploadDir .
                $nomFichier;


            if (
                move_uploaded_file(
                    $tmpName,
                    $destination
                )
            ) {

                $cheminBDD =
                    "uploads/annonces/" .
                    $nomFichier;


                $stmtPhoto = $pdo->prepare("
                    INSERT INTO photo
                    (
                        chemin_photo,
                        nom_original,
                        ordre_affichage,
                        est_principale,
                        id_annonce
                    )

                    VALUES
                    (
                        :chemin,
                        :nom_original,
                        :ordre,
                        :principale,
                        :id_annonce
                    )
                ");


                $stmtPhoto->execute([
                    ":chemin" => $cheminBDD,
                    ":nom_original" => $originalName,
                    ":ordre" => $i + 1,
                    ":principale" => ($i === 0 ? 1 : 0),
                    ":id_annonce" => $idAnnonce
                ]);
            }
        }
    }


    /* =====================================================
       TERMINER
       ===================================================== */

    $pdo->commit();


    echo json_encode([
        "success" => true,
        "message" => "Annonce modifiée avec succès."
    ], JSON_UNESCAPED_UNICODE);


} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }


    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la modification de l'annonce."
    ], JSON_UNESCAPED_UNICODE);
}