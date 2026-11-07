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
   2. VÉRIFIER LA MÉTHODE
   ========================================================= */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ]);

    exit;
}


/* =========================================================
   3. RÉCUPÉRER L'ID
   ========================================================= */

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$idAnnonce = isset($data["id_annonce"])
    ? (int) $data["id_annonce"]
    : 0;


if ($idAnnonce <= 0) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "ID de l'annonce invalide."
    ]);

    exit;
}


/* =========================================================
   4. VÉRIFIER QUE L'ANNONCE APPARTIENT À L'UTILISATEUR
   ========================================================= */

try {

    $sql = "
        SELECT id_annonce
        FROM annonce
        WHERE id_annonce = :id_annonce
        AND id_utilisateur = :id_utilisateur
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id_annonce" => $idAnnonce,
        ":id_utilisateur" => $idUtilisateur
    ]);


    if (!$stmt->fetch()) {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "Vous n'êtes pas autorisé à supprimer cette annonce."
        ]);

        exit;
    }


    /* =====================================================
       5. SUPPRIMER
       ===================================================== */

    $pdo->beginTransaction();


    /*
       Les photos seront supprimées automatiquement
       grâce à ON DELETE CASCADE.
    */

    $sqlDelete = "
        DELETE FROM annonce
        WHERE id_annonce = :id_annonce
        AND id_utilisateur = :id_utilisateur
    ";

    $stmtDelete = $pdo->prepare($sqlDelete);

    $stmtDelete->execute([
        ":id_annonce" => $idAnnonce,
        ":id_utilisateur" => $idUtilisateur
    ]);


    $pdo->commit();


    echo json_encode([
        "success" => true,
        "message" => "Annonce supprimée avec succès."
    ]);


} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la suppression."
    ]);
}