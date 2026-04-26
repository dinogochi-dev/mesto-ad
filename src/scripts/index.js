import { createCardElement, likeCard } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCardFromServer,
} from './components/api.js';

import '../pages/index.css';

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(
  ".popup_type_remove-card"
);
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const logoElement = document.querySelector(".header__logo");

let currentUserId = null;
let cardToDelete = null;
let cardElementToDelete = null;

const renderLoading = (button, isLoading, defaultText) => {
  if (isLoading) {
    button.textContent = defaultText === "Создать" ? "Создание..." : "Сохранение...";
  } else {
    button.textContent = defaultText;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, 'Сохранить');
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Сохранить");

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      clearValidation(avatarForm, validationConfig);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, 'Сохранить');
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Создать");

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(
          newCard,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: handleDeleteClick,
          },
          currentUserId
        )
      );

      cardForm.reset();
      clearValidation(cardForm, validationConfig);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, 'Создать');
    });
};

const handleDeleteClick = (cardElement, cardId) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = removeCardForm.querySelector(".popup__button");
  renderLoading(submitButton, true, "Да");

  deleteCardFromServer(cardToDelete)
    .then(() => {
      cardElementToDelete.remove();
      cardToDelete = null;
      cardElementToDelete = null;
      closeModalWindow(removeCardModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, 'Да');
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const element = template.content.querySelector(".popup__info-item").cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserPreview = (userName) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const element = template.content.querySelector(".popup__list-item").cloneNode(true);
  element.textContent = userName;
  return element;
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      while (usersStatsModalInfoList.firstChild) {
        usersStatsModalInfoList.removeChild(usersStatsModalInfoList.firstChild);
      }
      while (usersStatsModalUsersList.firstChild) {
        usersStatsModalUsersList.removeChild(usersStatsModalUsersList.firstChild);
      }

      const usersMap = {};
      cards.forEach((card) => {
        const ownerId = card.owner._id;
        if (!usersMap[ownerId]) {
          usersMap[ownerId] = {
            name: card.owner.name,
            count: 0,
          };
        }
        usersMap[ownerId].count += 1;
      });

      const uniqueUsers = Object.values(usersMap);

      usersStatsModalTitle.textContent = 'Статистика пользователей';

      usersStatsModalInfoList.append(
        createInfoString('Всего карточек:', cards.length)
      );
      usersStatsModalInfoList.append(
        createInfoString('Всего пользователей:', uniqueUsers.length)
      );
      usersStatsModalInfoList.append(
        createInfoString(
          'Первая создана:',
          formatDate(new Date(cards[cards.length - 1].createdAt))
        )
      );
      usersStatsModalInfoList.append(
        createInfoString(
          'Последняя создана:',
          formatDate(new Date(cards[0].createdAt))
        )
      );

      usersStatsModalText.textContent = 'Пользователи';

      uniqueUsers.forEach((user) => {
        usersStatsModalUsersList.append(
          createUserPreview(`${user.name} (${user.count})`)
        );
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.error(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardFormSubmit);

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            onDeleteCard: handleDeleteClick,
          },
          currentUserId
        )
      );
    });
  })
  .catch((err) => {
    console.error(err);
  });

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);