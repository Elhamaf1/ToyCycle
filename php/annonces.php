<?php

// ============================================================
// TOYCYCLE - RÉCUPÉRER TOUTES LES ANNONCES
// PHP + MYSQL
// ============================================================

header("Content-Type: application/json; charset=UTF-8");

require_once "connexion.php";


// ============================================================
// REQUÊTE
// ============================================================

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

        WHERE s.nom_statut <> 'Supprimée'

        ORDER BY a.date_publication DESC
    ";


    $stmt = $pdo->prepare($sql);

    $stmt->execute();

    $annonces = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ========================================================
    // RÉCUPÉRER LES PHOTOS
    // ========================================================

    $sqlPhotos = "
        SELECT
            id_photo,
            chemin_photo,
            est_principale,
            ordre_affichage

        FROM photo

        WHERE id_annonce = :id_annonce

        ORDER BY
            est_principale DESC,
            ordre_affichage ASC,
            id_photo ASC
    ";

    $stmtPhotos = $pdo->prepare($sqlPhotos);


    // ========================================================
    // AJOUTER LES PHOTOS À CHAQUE ANNONCE
    // ========================================================

    foreach ($annonces as &$annonce) {

        $stmtPhotos->execute([
            ":id_annonce" =>
                $annonce["id_annonce"]
        ]);

        $photos =
            $stmtPhotos->fetchAll(
                PDO::FETCH_ASSOC
            );


        $annonce["images"] = [];


        foreach ($photos as $photo) {

            $annonce["images"][] = [
                "chemin" =>
                    $photo["chemin_photo"],

                "principale" =>
                    (bool)$photo["est_principale"]
            ];
        }


        // ====================================================
        // CONVERTIR LE PRIX
        // ====================================================

        if ($annonce["prix"] !== null) {

            $annonce["prix"] =
                (float)$annonce["prix"];

        }


        // ====================================================
        // ID EN NOMBRE
        // ====================================================

        $annonce["id_annonce"] =
            (int)$annonce["id_annonce"];
    }

    unset($annonce);


    // ========================================================
    // RÉPONSE
    // ========================================================

    echo json_encode(
        [
            "success" => true,
            "annonces" => $annonces
        ],
        JSON_UNESCAPED_UNICODE
    );


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode(
        [
            "success" => false,
            "message" =>
                "Erreur lors de la récupération des annonces."
        ],
        JSON_UNESCAPED_UNICODE
    );
}