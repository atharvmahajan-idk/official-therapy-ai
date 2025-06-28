// This is a placeholder for your application's JavaScript code.
// You can add your theme switching logic here, for example.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Therapy AI UI is ready!');

    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const body = document.body;

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');

        // Optional: Save theme preference to local storage
        if (body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });

    // Optional: Load theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme === 'light') {
        body.classList.add('light-theme');
    }

    // AI Summary Modal functionality
    const summaryBtn = document.querySelector('.summary-btn');
    const modal = document.getElementById('summary-modal');
    const closeModalBtn = document.querySelector('.modal-close');

    const openModal = () => {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);
    };

    const closeModal = () => {
        modal.classList.remove('visible');
        setTimeout(() => modal.style.display = 'none', 300); // Wait for transition to end
    };

    if (summaryBtn && modal && closeModalBtn) {
        summaryBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        // Close modal if user clicks on the overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal with the 'Escape' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) {
                closeModal();
            }
        });
    }
}); 