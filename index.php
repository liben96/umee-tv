<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>u-mee IPTV Management</title>

    <!-- styles start -->
    <link href="./assets/css/datatables.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/bootstrap.min.css" rel="stylesheet">
    </link>
    <link href="./assets/css/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="./assets/css/fontawesome/css/solid.min.css" rel="stylesheet">
    <link href="./assets/css/style.css" rel="stylesheet">
    </link>
    <!-- styles end -->
</head>

<body>
    <div class="container my-5">
        <div class="row mb-5">
            <div class="col">
                <img src="./assets/images/umee.png" class="img-fluid" alt="umee-logo">
            </div>
            <div class="col d-flex justify-content-end align-items-center">
                <a class="button" href="javascript:void(0)">Admin</a>
            </div>
        </div>
        <div class="row box p-5">
            <div class="col">
                <table class="table" id="tv-list">
                </table>
            </div>
        </div>
    </div>

    <!-- scripts start -->
    <script src="./assets/js/jquery-3.7.0.min.js"></script>
    <script src="./assets/js/datatables.min.js"></script>
    <script src="./assets/js/bootstrap.bundle.min.js"
        integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe"></script>
    <script src="./src/app.js"></script>
    <!-- scripts end -->
</body>

</html>