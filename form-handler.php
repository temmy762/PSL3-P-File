<?php
/**
 * PSL3 Productions - Form Handler
 * 
 * Simple PHP script to handle form submissions from the website
 * Upload this file to the root directory of your Hostinger hosting
 */

// Configuration
$config = [
    'admin_email' => 'psl3productions@gmail.com',
    'from_email' => 'no-reply@psl3productions.com',
    'subject_prefix' => 'PSL3 Productions Website: ',
    'success_page' => 'thank-you.html',
    'error_page' => 'error.html',
    'allowed_forms' => [
        'contact' => [
            'fields' => ['name', 'email', 'phone', 'message'],
            'required' => ['name', 'email', 'message'],
            'subject' => 'New Contact Form Submission'
        ],
        'booking' => [
            'fields' => ['name', 'email', 'phone', 'eventDate', 'eventLocation', 'guestCount', 'eventType', 'durationHours', 'specialRequests'],
            'required' => ['name', 'email', 'phone', 'eventDate'],
            'subject' => 'New Booking Inquiry'
        ]
    ]
];

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 403 Forbidden');
    exit('Direct access forbidden.');
}

// Determine which form was submitted
$form_type = isset($_POST['form_type']) ? $_POST['form_type'] : 'contact';

// Validate form type
if (!array_key_exists($form_type, $config['allowed_forms'])) {
    redirect_with_error('Invalid form submission.');
}

// Get form configuration
$form_config = $config['allowed_forms'][$form_type];

// Collect and validate form data
$form_data = [];
$errors = [];

// Check required fields
foreach ($form_config['required'] as $field) {
    if (empty($_POST[$field])) {
        $errors[] = "Field '$field' is required.";
    }
}

// If no errors, proceed with collecting all form data
if (empty($errors)) {
    foreach ($form_config['fields'] as $field) {
        if (isset($_POST[$field])) {
            $form_data[$field] = htmlspecialchars($_POST[$field]);
        }
    }
}

// If validation passed, process the form
if (empty($errors)) {
    // Prepare email
    $subject = $config['subject_prefix'] . $form_config['subject'];
    $message = build_email_message($form_data, $form_type);
    $headers = [
        'From: ' . $config['from_email'],
        'Reply-To: ' . $form_data['email'],
        'X-Mailer: PHP/' . phpversion(),
        'Content-Type: text/html; charset=UTF-8'
    ];
    
    // Send email
    $mail_success = mail(
        $config['admin_email'], 
        $subject, 
        $message, 
        implode("\r\n", $headers)
    );
    
    if ($mail_success) {
        // Redirect to thank you page
        header('Location: ' . $config['success_page']);
        exit;
    } else {
        redirect_with_error('Failed to send email. Please try again later.');
    }
} else {
    // Redirect with errors
    redirect_with_error(implode(' ', $errors));
}

/**
 * Build email message from form data
 */
function build_email_message($data, $form_type) {
    $html = '<html><body>';
    $html .= '<h1>' . ($form_type == 'contact' ? 'New Contact Form Submission' : 'New Booking Inquiry') . '</h1>';
    $html .= '<table style="width: 100%; border-collapse: collapse;">';
    
    foreach ($data as $key => $value) {
        // Format field name for display
        $field_name = ucwords(str_replace(['_', 'event'], [' ', 'Event '], $key));
        
        $html .= '<tr>';
        $html .= '<td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">' . $field_name . '</td>';
        $html .= '<td style="padding: 8px; border: 1px solid #ddd;">' . nl2br($value) . '</td>';
        $html .= '</tr>';
    }
    
    $html .= '</table>';
    $html .= '<p style="margin-top: 20px;">This email was sent from the PSL3 Productions website form at ' . date('Y-m-d H:i:s') . '</p>';
    $html .= '</body></html>';
    
    return $html;
}

/**
 * Redirect with error message
 */
function redirect_with_error($error) {
    // Store error in session
    session_start();
    $_SESSION['form_error'] = $error;
    
    // Redirect to error page
    header('Location: ' . $config['error_page']);
    exit;
}
?>
