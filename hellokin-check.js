  const displayName = document.getElementById('displayName');
  const themeChoice = document.getElementById('themeChoice');
  const notifications = document.getElementById('notifications');
  const settingsMessage = document.getElementById('settingsMessage');

  const profilePreview = document.getElementById('profilePicturePreview');
  const homeAvatar = document.getElementById('homeProfilePicture');

  function syncHomeAvatar() {
    if (homeAvatar && profilePreview && profilePreview.src &&
        profilePreview.getAttribute('src') &&
        profilePreview.getAttribute('src').trim()) {
      homeAvatar.src = profilePreview.src;
    }
  }

  syncHomeAvatar();
  const profileFile = document.getElementById('profilePictureFile');
  const profileMessage = document.getElementById('profilePictureMessage');

  window.addEventListener('hellokin-profile', event => {
    if (event.detail?.photoURL) { profilePreview.src = event.detail.photoURL; syncHomeAvatar(); }
  });

  profileFile.addEventListener('change', () => {
    const file = profileFile.files?.[0];
    if (file) { profilePreview.src = URL.createObjectURL(file); syncHomeAvatar(); }
  });

  document.getElementById('uploadProfilePicture').addEventListener('click', async () => {
    const file = profileFile.files?.[0];
    if (!file) {
      profileMessage.textContent = 'Choose a picture first.';
      return;
    }
    profileMessage.textContent = 'Uploading picture...';
    try {
      if (!window.hkChat?.saveProfilePicture) throw new Error('Chat is still loading. Try again shortly.');
      await window.hkChat.saveProfilePicture(file);
      profileMessage.textContent = 'Profile picture saved to your account.';
    } catch (error) {
      profileMessage.textContent = error.message || 'Upload failed.';
    }
  });

  try {
    const saved = JSON.parse(localStorage.getItem('hellokin-settings') || '{}');
    displayName.value = saved.displayName || '';

    for (const id of [
      'dateOfBirth', 'phoneCountryCode', 'phoneNumber', 'gender',
      'school', 'hometown', 'state', 'country', 'continent',
      'hobbies', 'homeAddress'
    ]) {
      const field = document.getElementById(id);
      if (field) field.value = saved[id] || (id === 'phoneCountryCode' ? '+234' : '');
    }
    document.getElementById('showProfileDetails').checked = !!saved.showProfileDetails;

    themeChoice.value = saved.theme || 'light';
    notifications.checked = !!saved.notifications;
  } catch {}

  function applyTheme(theme) {
    document.body.style.background = theme === 'dark' ? '#111827' : '#eef2f6';
    document.body.style.color = theme === 'dark' ? '#f9fafb' : '#14213d';
    document.querySelectorAll('.card').forEach(card => {
      card.style.background = theme === 'dark' ? '#1f2937' : '#fff';
    });
  }

  applyTheme(themeChoice.value);

  themeChoice.addEventListener('change', () => applyTheme(themeChoice.value));


  document.getElementById('hellokinChangeUsername').addEventListener('click', () => {
    if (window.hkChat && window.hkChat.changeUsername) {
      window.hkChat.changeUsername();
    } else {
      settingsMessage.textContent = 'Open Chat and sign in first, then try again.';
    }
  });

  document.getElementById('hellokinSignOut').addEventListener('click', async () => {
    if (window.hkChat && window.hkChat.signOut) {
      await window.hkChat.signOut();
      settingsMessage.textContent = 'Signed out.';
    } else {
      settingsMessage.textContent = 'Open Chat and sign in first.';
    }
  });

  document.getElementById('saveSettings').addEventListener('click', () => {
    const dobValue = document.getElementById('dateOfBirth').value;
    if (!dobValue) {
      settingsMessage.textContent = 'Enter your date of birth first.';
      return;
    }
    const dob = new Date(dobValue + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    if (dob > today || age < 16) {
      settingsMessage.textContent = 'Hellokin registration is for people aged 16 and above.';
      return;
    }

    const settings = {
      displayName: displayName.value.trim(),
      dateOfBirth: document.getElementById('dateOfBirth').value,
      phoneCountryCode: document.getElementById('phoneCountryCode').value,
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      gender: document.getElementById('gender').value,
      school: document.getElementById('school').value.trim(),
      hometown: document.getElementById('hometown').value.trim(),
      state: document.getElementById('state').value.trim(),
      country: document.getElementById('country').value.trim(),
      continent: document.getElementById('continent').value,
      hobbies: document.getElementById('hobbies').value.trim(),
      homeAddress: document.getElementById('homeAddress').value.trim(),
      showProfileDetails: document.getElementById('showProfileDetails').checked,

      theme: themeChoice.value,
      notifications: notifications.checked
    };
    try {
      localStorage.setItem('hellokin-settings', JSON.stringify(settings));
      settingsMessage.textContent = 'Settings saved on this device. Phone number is not verified yet.';
      applyTheme(settings.theme);
    } catch {
      settingsMessage.textContent = 'Could not save settings on this device.';
    }
  });
    const textBox = document.getElementById("postText");
    const postsBox = document.getElementById("posts");
    const message = document.getElementById("message");
    let posts = [];

    try {
      posts = JSON.parse(localStorage.getItem("hellokin-posts") || "[]");
      if (!Array.isArray(posts)) posts = [];
    } catch { posts = []; }

    function renderPosts() {
      postsBox.replaceChildren();
      if (!posts.length) {
        postsBox.textContent = "No posts yet. Share the first one!";
        return;
      }
      posts.forEach(post => {
        const article = document.createElement("article");
        article.className = "post";
        const author = document.createElement("strong");
        author.textContent = "👤 Hellokin member";
        const content = document.createElement("p");
        content.textContent = post.text || "";
        const date = document.createElement("small");
        date.textContent = post.date || "";
        const actions = document.createElement("div");
        actions.className = "post-actions";
        const like = document.createElement("button");
        like.textContent = "👍 Like";
        like.addEventListener("click", () => {
          like.textContent = like.textContent === "👍 Like" ? "💙 Liked" : "👍 Like";
        });
        const comment = document.createElement("button");
        comment.textContent = "💬 Comment";
        comment.addEventListener("click", () => {
          const reply = prompt("Write a comment:");
          if (reply && reply.trim()) {
            const p = document.createElement("p");
            p.textContent = "💬 " + reply.trim();
            article.appendChild(p);
          }
        });
        actions.append(like, comment);
        article.append(author, content, date, actions);
        postsBox.appendChild(article);
      });
    }

    document.getElementById("postButton").addEventListener("click", () => {
      const text = textBox.value.trim();
      if (!text) {
        message.textContent = "Please write something first.";
        return;
      }
      posts.unshift({ text, date: new Date().toLocaleString() });
      posts = posts.slice(0, 50);
      try {
        localStorage.setItem("hellokin-posts", JSON.stringify(posts));
        message.textContent = "Post saved on this device.";
      } catch {
        message.textContent = "Could not save the post on this device.";
      }
      textBox.value = "";
      renderPosts();
    });

    document.getElementById("peopleInfo").addEventListener("click", () => {
      document.getElementById("peopleMessage").textContent =
        "Friend discovery and requests still need to be connected to Firebase.";
    });

    renderPosts();
 function showScreen(screenId) {
  const groups = {
    home: ['stories', 'home', 'feed'],
    reels: ['reels'],
    people: ['people'],
    profile: ['profile'],
    settings: ['settings']
  };

  const allScreens = Object.values(groups).flat();

  allScreens.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.add('app-screen');
      section.classList.remove('active-screen');
    }
  });

  (groups[screenId] || groups.home).forEach(id => {
    const section = document.getElementById(id);
    if (section) section.classList.add('app-screen', 'active-screen');
  });

  document.querySelectorAll('nav button[data-screen]').forEach(button => {
    button.classList.toggle('active-tab', button.dataset.screen === screenId);
  });

  window.scrollTo(0, 0);
}

 window.showScreen = showScreen;
 showScreen('home');

(function () {
  const splash = document.getElementById('hkSplash');
  if (!splash) return;
  let hidden = false;

  function hideSplash() {
    if (hidden) return;
    hidden = true;
    splash.classList.add('hk-hidden');
    setTimeout(() => splash.remove(), 350);
  }

  window.addEventListener('load', () => {
    setTimeout(hideSplash, 700);
  }, { once: true });

  setTimeout(hideSplash, 8000);
})();
