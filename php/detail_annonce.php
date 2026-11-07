<?php

// ============================================================
// TOYCYCLE - DÉTAIL D'UNE ANNONCE (GET)
// php/detail_annonce.php?id=5
// ============================================================
// Retourne :
//   - les informations de l'annonce
//   - la catégorie, l'âge, le type et l'état
//   - les informations du propriétaire
//   - le téléphone du propriétaire depuis la table utilisateur
//   - les photos
//   - est_favori
//   - est_proprietaire
// ============================================================

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once __DIR__ . "/connexion.php";


// ============================================================
// 1. VALIDER L'ID DE L'ANNONCE
// ============================================================

$id_annonce = isset($_GET["id"])
    ? (int) $_GET["id"]
    : 0;

if ($id_annonce <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Identifiant d'annonce invalide."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}


try {

    // ========================================================
    // 2. RÉCUPÉRER L'ANNONCE
    //
    // IMPORTANT :
    // Le téléphone vient de la table utilisateur :
    //
    // annonce.id_utilisateur
    //          ↓
    // utilisateur.id_utilisateur
    //          ↓
    // utilisateur.telephone
    // ========================================================

    $sql = "
        SELECT

            -- ================================================
            -- INFORMATIONS DE L'ANNONCE
            -- ================================================

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
            a.id_utilisateur,

            -- ================================================
            -- INFORMATIONS DU PROPRIÉTAIRE
            -- ================================================

            u.nom AS nom_utilisateur,
            u.prenom AS prenom_utilisateur,

            -- LE TÉLÉPHONE VIENT DU PROFIL
            u.telephone AS telephone_vendeur,

            u.photo_profil,
            u.ville AS ville_utilisateur,
            u.statut_compte AS statut_compte_vendeur,

            -- ================================================
            -- CATÉGORIE
            -- ================================================

            c.nom_categorie AS categorie,

            -- ================================================
            -- TRANCHE D'ÂGE
            -- ================================================

            ta.libelle AS age,

            -- ================================================
            -- TYPE D'ANNONCE
            -- ================================================

            t.nom_type AS mode,

            -- ================================================
            -- ÉTAT DU JOUET
            -- ================================================

            e.nom_etat AS etat,

            -- ================================================
            -- STATUT DE L'ANNONCE
            -- ================================================

            s.nom_statut AS statut

        FROM annonce a

        -- Propriétaire de l'annonce
        INNER JOIN utilisateur u
            ON u.id_utilisateur = a.id_utilisateur

        -- Catégorie
        INNER JOIN categorie c
            ON c.id_categorie = a.id_categorie

        -- Tranche d'âge
        INNER JOIN tranche_age ta
            ON ta.id_age = a.id_age

        -- Type
        INNER JOIN type_annonce t
            ON t.id_type = a.id_type

        -- État
        INNER JOIN etat_jouet e
            ON e.id_etat = a.id_etat

        -- Statut
        INNER JOIN statut_annonce s
            ON s.id_statut = a.id_statut

        WHERE a.id_annonce = :id_annonce

        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id_annonce" => $id_annonce
    ]);

    $annonce = $stmt->fetch(PDO::FETCH_ASSOC);


    // ========================================================
    // 3. VÉRIFIER SI L'ANNONCE EXISTE
    // ========================================================

    if (!$annonce) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Annonce introuvable."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    // ========================================================
    // 4. NETTOYER LE NUMÉRO DE TÉLÉPHONE
    //
    // Le numéro est récupéré depuis :
    // utilisateur.telephone
    // ========================================================

    if (
        !isset($annonce["telephone_vendeur"]) ||
        trim((string) $annonce["telephone_vendeur"]) === ""
    ) {

        $annonce["telephone_vendeur"] = null;

    } else {

        $annonce["telephone_vendeur"] =
            trim((string) $annonce["telephone_vendeur"]);
    }


    // ========================================================
    // 5. RÉCUPÉRER L'UTILISATEUR CONNECTÉ
    // ========================================================

    $id_utilisateur_session =
        $_SESSION["id_utilisateur"] ?? null;


    // ========================================================
    // 6. VÉRIFIER SI L'UTILISATEUR EST LE PROPRIÉTAIRE
    // ========================================================

    $est_proprietaire =
        $id_utilisateur_session !== null
        &&
        (int) $id_utilisateur_session ===
        (int) $annonce["id_utilisateur"];


    // ========================================================
    // 7. VÉRIFIER LE STATUT DE L'ANNONCE
    //
    // Supprimée :
    // personne ne peut la voir
    //
    // Masquée :
    // seul le propriétaire peut la voir
    // ========================================================

    if ($annonce["statut"] === "Supprimée") {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Annonce introuvable."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    if (
        $annonce["statut"] === "Masquée"
        &&
        !$est_proprietaire
    ) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Annonce introuvable."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    // ========================================================
    // 8. RÉCUPÉRER LES PHOTOS
    //
    // La photo principale est affichée en premier.
    // ========================================================

    $sqlPhotos = "
        SELECT chemin_photo

        FROM photo

        WHERE id_annonce = :id_annonce

        ORDER BY
            est_principale DESC,
            ordre_affichage ASC
    ";

    $stmtPhotos =
        $pdo->prepare($sqlPhotos);

    $stmtPhotos->execute([
        ":id_annonce" => $id_annonce
    ]);

    $annonce["images"] =
        $stmtPhotos->fetchAll(PDO::FETCH_COLUMN);


    // ========================================================
    // 9. VÉRIFIER SI L'ANNONCE EST DANS LES FAVORIS
    // ========================================================

    $est_favori = false;


    if ($id_utilisateur_session !== null) {

        $sqlFavori = "
            SELECT 1

            FROM favori

            WHERE id_utilisateur = :id_utilisateur

              AND id_annonce = :id_annonce

            LIMIT 1
        ";

        $stmtFavori =
            $pdo->prepare($sqlFavori);

        $stmtFavori->execute([
            ":id_utilisateur" =>
                $id_utilisateur_session,

            ":id_annonce" =>
                $id_annonce
        ]);

        $est_favori =
            (bool) $stmtFavori->fetchColumn();
    }


    // ========================================================
    // 10. AJOUTER LES INFORMATIONS SUPPLÉMENTAIRES
    // ========================================================

    $annonce["est_favori"] =
        $est_favori;

    $annonce["est_proprietaire"] =
        $est_proprietaire;


    // ========================================================
    // 11. CONVERTIR LES TYPES NUMÉRIQUES
    // ========================================================

    $annonce["id_annonce"] =
        (int) $annonce["id_annonce"];

    $annonce["id_utilisateur"] =
        (int) $annonce["id_utilisateur"];


    $annonce["prix"] =
        $annonce["prix"] !== null
            ? (float) $annonce["prix"]
            : null;


    $annonce["nombre_vues"] =
        (int) $annonce["nombre_vues"];


    $annonce["nombre_favoris"] =
        (int) $annonce["nombre_favoris"];


    // ========================================================
    // 12. COMPTABILISER LA VUE
    //
    // Le propriétaire ne compte pas comme une vue.
    // ========================================================

    if (!$est_proprietaire) {

        $sqlVue = "
            UPDATE annonce

            SET nombre_vues =
                nombre_vues + 1

            WHERE id_annonce = :id_annonce
        ";

        $stmtVue =
            $pdo->prepare($sqlVue);

        $stmtVue->execute([
            ":id_annonce" => $id_annonce
        ]);

        $annonce["nombre_vues"]++;
    }


    // ========================================================
    // 13. RÉPONSE JSON
    // ========================================================

    echo json_encode(
        [
            "success" => true,
            "annonce" => $annonce
        ],
        JSON_UNESCAPED_UNICODE
        | JSON_UNESCAPED_SLASHES
    );


} catch (PDOException $e) {

    // ========================================================
    // ERREUR MYSQL / PDO
    // ========================================================

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Erreur serveur lors de la récupération de l'annonce."
    ], JSON_UNESCAPED_UNICODE);
}
?>