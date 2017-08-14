
$(function () {
  const predefinedMessages = {
    'registration_successful': "Registration successful! Hereafter Documentation will be pushed to the GitHub pages on each commit.",
    'registration_already': "This repository has already been registered.",
    'registration_failed': "Failed to register repository to Yaydoc!",
    'registration_unauthorized': "You do not have admin permission for this repository.",
    'registration_mismatch': "A hook for Yaydoc is created but the repository is not registered!",
    'delete_success': "Repository removed from Yaydoc successfully",
    'delete_failure': "Failed to remove repository!",
    'enabled_successful': "Yaydoc enabled successfully for this repository",
    'disabled_successful': "Yaydoc disabled successfully for this repository"
  };

  if ((predefinedMessages[styles.getParameterByName("status")] || '') !== '') {
    styles.showNotification(predefinedMessages[styles.getParameterByName("status")]);
    window.history.pushState("", "", location.pathname);
  }
});
