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
    ]);

    exit;
}


$idUtilisateur = (int) $_SESSION["id_utilisateur"];


/* =========================================================
   2. RÉCUPÉRER LES ANNONCES
   ========================================================= */

try {

    $sql = "
        SELECT
            a.id_annonce,
            a.titre,
            a.description,
            a.prix,
            a.ville,
            a.date_publication,
            a.date_modification,
            a.date_expiration,
            a.nombre_vues,
            a.nombre_favoris,

            u.id_utilisateur,
            u.nom,
            u.prenom,
            u.telephone,

            c.id_categorie,
            c.nom_categorie AS categorie,

            ta.id_age,
            ta.libelle AS age,

            t.id_type,
            t.nom_type AS mode,

            e.id_etat,
            e.nom_etat AS etat,

            s.id_statut,
            s.nom_statut AS statut

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

        INNER JOIN statut_annonce s
            ON a.id_statut = s.id_statut

        WHERE a.id_utilisateur = :id_utilisateur

        ORDER BY a.date_publication DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id_utilisateur" => $idUtilisateur
    ]);

    $annonces = $stmt->fetchAll();


    /* =====================================================
       3. RÉCUPÉRER LES PHOTOS
       ===================================================== */

    $sqlPhotos = "
        SELECT
            id_photo,
            chemin_photo,
            nom_original,
            ordre_affichage,
            est_principale

        FROM photo

        WHERE id_annonce = :id_annonce

        ORDER BY ordre_affichage ASC
    ";

    $stmtPhotos = $pdo->prepare($sqlPhotos);


    foreach ($annonces as &$annonce) {

        $stmtPhotos->execute([
            ":id_annonce" => $annonce["id_annonce"]
        ]);

        $photos = $stmtPhotos->fetchAll();

        $annonce["images"] = [];

        foreach ($photos as $photo) {

            $annonce["images"][] = [
                "id_photo" => (int) $photo["id_photo"],
                "chemin" => $photo["chemin_photo"],
                "nom" => $photo["nom_original"],
                "ordre" => (int) $photo["ordre_affichage"],
                "principale" => (bool) $photo["est_principale"]
            ];
        }
    }

    unset($annonce);


    /* =====================================================
       4. RÉPONSE
       ===================================================== */

    echo json_encode([
        "success" => true,
        "annonces" => $annonces
    ], JSON_UNESCAPED_UNICODE);


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des annonces."
    ]);
}