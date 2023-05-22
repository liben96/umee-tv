<?php session_start(); ?>
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
    <link href="./assets/css/flatpickr.min.css" rel="stylesheet">
    <link href="./assets/css/style.css" rel="stylesheet">
    </link>
    <?php if(!isset($_SESSION['userId'])) : ?>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f7f7f7;
        }

        .card {
            width: 400px;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
            text-align: center;
            color: #333;
        }

        .form-control {
            border-color: #ddd;
        }

        .form-control:focus {
            border-color: #009688;
            box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.25);
        }

        .form-check-label {
            color: #666;
        }

        .btn-primary {
            background-color: #009688;
            border-color: #009688;
        }

        .btn-primary:hover {
            background-color: #008077;
            border-color: #008077;
        }

        .btn-primary:focus {
            box-shadow: 0 0 0 0.2rem rgba(0, 150, 136, 0.5);
        }
    </style>
    <?php endif; ?>
    <!-- styles end -->
</head>

<body>
    <?php if(!isset($_SESSION['userId'])): ?>
    <div class="card">
        <div class="text-center">
            <img src=" ./assets/images/umee_smile_allblack.png" class="mb-4" style="width:140px;" alt="umee-logo">
        </div>
        <!-- <h2 class="mb-4">Login</h2> -->
        <form id="login-form">
            <div class="mb-3">
                <label for="username" class="form-label">Username*</label>
                <input type="text" class="form-control" id="username" placeholder="Enter username" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password*</label>
                <input type="password" class="form-control" id="password" placeholder="Enter password" required>
            </div>
            <!-- <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember">
                <label class="form-check-label" for="remember">Remember me</label>
            </div> -->
            <button id="login-submit-button" type="submit" class="btn btn-primary"><span class="loader d-none">
                    <i class="fa fa-spinner fa-spin"></i>
                </span>Login</button>
        </form>
    </div>
    <?php else: ?>
    <div class="header">
        <img src="./assets/images/umee_smile_allwhite.png" class="umee-logo" alt="umee-logo">
        <nav>
            <ul>
                <li><?php echo $_SESSION['username']?>
                </li>
                <li><button type="button" id="logout" class="button">Logout</button></li>
            </ul>
        </nav>
    </div>
    <div class="container-fluid">
        <div class="m-4">
            <!-- <div class="row mb-5">
                <div class="col">
                    <img src="./assets/images/umee.png" class="img-fluid" alt="umee-logo">
                </div>
                <div class="col d-flex justify-content-end align-items-center">
                    <a class="button" href="javascript:void(0)">Admin</a>
                </div>
            </div> -->
            <div class="row">
                <div class="col">
                    <table class="table nowrap table-striped dt-responsive" id="tv-list" style="width:100%">
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal for channel edit -->
    <div id="edit-modal" class="modal fade">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 745px;">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Edit Channel</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="edit-form">
                    <div class="modal-body">
                        <div class="row mb-1">
                            <label for="input_logo" class="col-sm-2 col-form-label"></label>
                            <div class="col-sm-10 d-flex align-items-center">
                                <img id="input_logo" src="./assets/images/umee_smile_allwhite.png"
                                    class="channel-logo me-2" alt="channel-logo">
                                <input id="input_logo_input" class="form-control" type="file" name="image" id="image"
                                    accept="image/*" />
                            </div>
                        </div>
                        <div class="row mb-1 d-none">
                            <label for="input_id" class="col-sm-2 col-form-label text-end">ID</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_id" readonly>
                            </div>
                        </div>
                        <div class="row mb-1 d-none">
                            <label for="input_name" class="col-sm-2 col-form-label text-end">Channel Number*</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_name" readonly>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_channelName" class="col-sm-2 col-form-label">Name*</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_channelName" required>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeSourceId" class="col-sm-2 col-form-label">Source</label>
                            <div class="col-sm-10">
                                <select id="input_typeSourceId" class="form-select" aria-label="Source">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeOTTId" class="col-sm-2 col-form-label">OTT</label>
                            <div class="col-sm-10">
                                <select id="input_typeOTTId" class="form-select" aria-label="OTT">
                                </select>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_ip" class="col-sm-2 col-form-label">IP</label>
                            <div class="col-sm-10">
                                <input type="text" class="form-control" id="input_ip">
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePVIId" class="col-sm-2 col-form-label">PVI</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePVIId" class="form-select" aria-label="PVI">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pviPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_pviPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typePDUId" class="col-sm-2 col-form-label">PDU</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <select id="input_typePDUId" class="form-select" aria-label="PDU">
                                        </select>
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_pduPort" class="col-sm-3 col-form-label">Port</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_pduPort">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_box" class="col-sm-2 col-form-label">Box</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_box">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_rack" class="col-sm-3 col-form-label">Rack</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_rack">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_cardNumber" class="col-sm-2 col-form-label">Card Number</label>
                            <div class="col-sm-10">
                                <div class="row">
                                    <div class="col-sm-5">
                                        <input type="text" class="form-control" id="input_cardNumber">
                                    </div>
                                    <div class="col-sm-7">
                                        <div class="row">
                                            <label for="input_cardNumberExpiry"
                                                class="col-sm-3 col-form-label">Expiry</label>
                                            <div class="col-sm-9">
                                                <input type="text" class="form-control" id="input_cardNumberExpiry">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-1">
                            <label for="input_typeEscalationId" class="col-sm-2 col-form-label">Escalation</label>
                            <div class="col-sm-10">
                                <select id="input_typeEscalationId" class="form-select" aria-label="Escalation">
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_priority" class="col-sm-2 col-form-label">Priority</label>
                            <div class="col-sm-10">
                                <input type="checkbox" class="form-check-input" id="input_priority"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                        <div class="row">
                            <label for="input_enabled" class="col-sm-2 col-form-label">Enabled</label>
                            <div class="col-sm-10">
                                <input type="checkbox" class="form-check-input" id="input_enabled"
                                    style="padding: 0.32rem 0.4rem;">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary" id="channel-submit-button"><span
                                class="loader d-none">
                                <i class="fa fa-spinner fa-spin"></i>
                            </span>Save</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </form>
            </div>
        </div>
        <?php endif; ?>

        <!-- notification -->
        <div id="notification-container" class="position-fixed">
            <div id="notification" class="toast align-items-center text-white border-0" role="alert"
                aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                        aria-label="Close"></button>
                </div>
            </div>
        </div>
    </div>

    <!-- scripts start -->
    <script src="./assets/js/jquery-3.7.0.min.js"></script>
    <script src="./assets/js/jquery.validate.min.js"></script>
    <script src="./assets/js/bootstrap.bundle.min.js"></script>
    <script src="./assets/js/datatables.min.js"></script>
    <script src="./assets/js/flatpickr.js"></script>
    <script src="./assets/js/moment.min.js"></script>
    <script type="text/javascript">
        // prettier-ignore
        let username = '<?php if(isset($_SESSION['username'])) {
            echo $_SESSION['username'];
        } else {
            echo null;
        } ?>'
        // prettier-ignore
        let userId = '<?php if(isset($_SESSION['userId'])) {
            echo $_SESSION['userId'];
        } else {
            echo null;
        } ?>'
        if (userId) userId = parseFloat(userId);
        // prettier-ignore
        let roleId = '<?php if(isset($_SESSION['roleId'])) {
            echo $_SESSION['roleId'];
        } else {
            echo null;
        } ?>'
        if (roleId) roleId = parseFloat(roleId);
    </script>
    <script src="./src/app.js"></script>
    <!-- scripts end -->
</body>

</html>