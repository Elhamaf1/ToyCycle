<?php

// ============================================================
// TOYCYCLE - ANNONCES ACCUEIL
// Récupérer les annonces depuis MySQL
// ============================================================

header("Content-Type: application/json; charset=UTF-8");

require_once "connexion.php";

try {

    // ========================================================
    // RÉCUPÉRER LES ANNONCES
    // ========================================================

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

            s.nom_statut AS statut,

            u.telephone

        FROM annonce a

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

        INNER JOIN utilisateur u
            ON a.id_utilisateur = u.id_utilisateur

        WHERE s.nom_statut = 'Disponible'

        ORDER BY a.date_publication DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute();

    $annonces = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ========================================================
    // RÉCUPÉRER LES PHOTOS
    // ========================================================

    foreach ($annonces as &$annonce) {

        $sqlPhotos = "
            SELECT
                chemin_photo
            FROM photo
            WHERE id_annonce = ?
            ORDER BY
                est_principale DESC,
                ordre_affichage ASC,
                id_photo ASC
        ";

        $stmtPhotos = $pdo->prepare($sqlPhotos);

        $stmtPhotos->execute([
            $annonce["id_annonce"]
        ]);

        $photos = $stmtPhotos->fetchAll(PDO::FETCH_COLUMN);


        // Ajouter les photos à l'annonce

        $annonce["images"] = $photos;


        // Transformer l'id MySQL en id utilisé par JS

        $annonce["id"] =
            (int) $annonce["id_annonce"];


        // Prix en nombre

        if ($annonce["prix"] !== null) {

            $annonce["prix"] =
                (float) $annonce["prix"];

        }


        // Supprimer id_annonce si inutile côté JS

        unset($annonce["id_annonce"]);


        // Date utilisée par JavaScript

        $annonce["datePublication"] =
            $annonce["date_publication"];

    }

    unset($annonce);


    // ========================================================
    // RÉPONSE
    // ========================================================

    echo json_encode([
        "success" => true,
        "annonces" => $annonces
    ], JSON_UNESCAPED_UNICODE);


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des annonces."
    ], JSON_UNESCAPED_UNICODE);

}