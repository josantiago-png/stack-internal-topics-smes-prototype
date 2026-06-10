<script lang="ts">
  import { Navigation, NavigationItem, NavigationTitle } from '@stackoverflow/stacks-svelte';
  import { base } from '$app/paths';
  import {
    IconHome,
    IconHomeFill,
    IconQuestion,
    IconQuestionFill,
    IconDocument,
    IconBookmark,
    IconBookmarkFill,
    IconTag,
    IconTagFill,
    IconCommunity,
    IconCommunityFill,
    IconUser,
    IconDashboard,
    IconDashboardFill,
    IconSettings,
    IconSettingsFill,
    IconInbox,
    IconInboxFill,
    IconSearch,
    IconSearchFill,
    IconStackBoxes,
  } from '@stackoverflow/stacks-icons/icons';

  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/community' }: Props = $props();

  const isSelected = (path: string) =>
    currentPath === path || currentPath.startsWith(path + '/');

  const logoSvg = `<svg class="logo-svg" width="148" height="28" viewBox="0 0 185 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M38.7069 24.7213L44.0089 8.66131H49.8389L55.3389 24.7213H51.5989L47.1549 11.1473L48.2989 11.6093H45.4609L46.6489 11.1473L42.3149 24.7213H38.7069ZM42.7329 20.7393L43.8329 17.7473H50.1249L51.2469 20.7393H42.7329ZM62.4545 25.1393C61.4132 25.1393 60.5039 24.9706 59.7265 24.6333C58.9639 24.2813 58.3259 23.812 57.8125 23.2253C57.2992 22.6386 56.9179 21.9786 56.6685 21.2453C56.4192 20.4973 56.2945 19.7273 56.2945 18.9353V18.5173C56.2945 17.696 56.4265 16.9113 56.6905 16.1633C56.9545 15.4006 57.3432 14.726 57.8565 14.1393C58.3699 13.5526 59.0079 13.0906 59.7705 12.7533C60.5479 12.416 61.4352 12.2473 62.4325 12.2473C63.5179 12.2473 64.4785 12.46 65.3145 12.8853C66.1505 13.296 66.8179 13.8753 67.3165 14.6233C67.8152 15.3713 68.0939 16.2293 68.1525 17.1973H64.6985C64.6399 16.6546 64.4199 16.2 64.0385 15.8333C63.6719 15.452 63.1365 15.2613 62.4325 15.2613C61.8459 15.2613 61.3545 15.408 60.9585 15.7013C60.5772 15.9946 60.2912 16.398 60.1005 16.9113C59.9099 17.4246 59.8145 18.0333 59.8145 18.7373C59.8145 19.3826 59.9025 19.9693 60.0785 20.4973C60.2545 21.0106 60.5332 21.414 60.9145 21.7073C61.3105 21.986 61.8239 22.1253 62.4545 22.1253C62.9239 22.1253 63.3199 22.0446 63.6425 21.8833C63.9799 21.7073 64.2439 21.4726 64.4345 21.1793C64.6399 20.8713 64.7645 20.5193 64.8085 20.1233H68.2405C68.1965 21.1206 67.9179 22.0006 67.4045 22.7633C66.8912 23.5113 66.2092 24.098 65.3585 24.5233C64.5079 24.934 63.5399 25.1393 62.4545 25.1393ZM70.4917 24.7213V12.6653H73.2857V17.8573H73.0877C73.0877 16.6253 73.2417 15.5986 73.5497 14.7773C73.8577 13.956 74.3197 13.34 74.9357 12.9293C75.5517 12.504 76.3071 12.2913 77.2017 12.2913H77.3557C78.2651 12.2913 79.0204 12.504 79.6217 12.9293C80.2377 13.34 80.6997 13.956 81.0077 14.7773C81.3304 15.5986 81.4917 16.6253 81.4917 17.8573H80.6337C80.6337 16.6253 80.7877 15.5986 81.0957 14.7773C81.4184 13.956 81.8877 13.34 82.5037 12.9293C83.1197 12.504 83.8751 12.2913 84.7697 12.2913H84.9237C85.8331 12.2913 86.5957 12.504 87.2117 12.9293C87.8424 13.34 88.3191 13.956 88.6417 14.7773C88.9644 15.5986 89.1257 16.6253 89.1257 17.8573V24.7213H85.6057V17.6593C85.6057 16.9993 85.4297 16.464 85.0777 16.0533C84.7404 15.6426 84.2564 15.4373 83.6257 15.4373C82.9951 15.4373 82.4964 15.65 82.1297 16.0753C81.7631 16.486 81.5797 17.036 81.5797 17.7253V24.7213H78.0377V17.6593C78.0377 16.9993 77.8617 16.464 77.5097 16.0533C77.1724 15.6426 76.6957 15.4373 76.0797 15.4373C75.4344 15.4373 74.9284 15.65 74.5617 16.0753C74.1951 16.486 74.0117 17.036 74.0117 17.7253V24.7213H70.4917ZM97.6485 25.1393C96.6218 25.1393 95.7125 24.9633 94.9205 24.6113C94.1432 24.2593 93.4905 23.79 92.9625 23.2033C92.4492 22.602 92.0532 21.9346 91.7745 21.2013C91.5105 20.4533 91.3785 19.6906 91.3785 18.9133V18.4733C91.3785 17.6666 91.5105 16.8966 91.7745 16.1633C92.0532 15.4153 92.4492 14.748 92.9625 14.1613C93.4758 13.5746 94.1138 13.1126 94.8765 12.7753C95.6538 12.4233 96.5338 12.2473 97.5165 12.2473C98.8072 12.2473 99.8925 12.5406 100.773 13.1273C101.667 13.6993 102.349 14.4546 102.819 15.3933C103.288 16.3173 103.523 17.3293 103.523 18.4293V19.6173H92.8525V17.6153H101.389L100.245 18.5393C100.245 17.8206 100.142 17.2046 99.9365 16.6913C99.7312 16.178 99.4232 15.7893 99.0125 15.5253C98.6165 15.2466 98.1178 15.1073 97.5165 15.1073C96.9005 15.1073 96.3798 15.2466 95.9545 15.5253C95.5292 15.804 95.2065 16.2146 94.9865 16.7573C94.7665 17.2853 94.6565 17.938 94.6565 18.7153C94.6565 19.434 94.7592 20.0646 94.9645 20.6073C95.1698 21.1353 95.4925 21.546 95.9325 21.8393C96.3725 22.1326 96.9445 22.2793 97.6485 22.2793C98.2938 22.2793 98.8218 22.1546 99.2325 21.9053C99.6432 21.656 99.9218 21.348 100.069 20.9813H103.303C103.127 21.788 102.782 22.5066 102.269 23.1373C101.755 23.768 101.11 24.2593 100.333 24.6113C99.5552 24.9633 98.6605 25.1393 97.6485 25.1393ZM118.284 25.1393C116.847 25.1393 115.593 24.9046 114.522 24.4353C113.451 23.9513 112.564 23.306 111.86 22.4993C111.171 21.6926 110.657 20.798 110.32 19.8153C109.983 18.8326 109.814 17.85 109.814 16.8673V16.3833C109.814 15.3713 109.983 14.3813 110.32 13.4133C110.657 12.4453 111.163 11.5653 111.838 10.7733C112.527 9.98131 113.378 9.35064 114.39 8.88131C115.417 8.41198 116.597 8.17731 117.932 8.17731C119.384 8.17731 120.667 8.44864 121.782 8.99131C122.897 9.51931 123.791 10.26 124.466 11.2133C125.141 12.152 125.529 13.2446 125.632 14.4913H122.024C121.936 13.9046 121.701 13.3913 121.32 12.9513C120.953 12.5113 120.477 12.1666 119.89 11.9173C119.318 11.668 118.665 11.5433 117.932 11.5433C117.228 11.5433 116.597 11.668 116.04 11.9173C115.497 12.1666 115.028 12.5186 114.632 12.9733C114.251 13.428 113.957 13.9706 113.752 14.6013C113.561 15.2173 113.466 15.8993 113.466 16.6473C113.466 17.4246 113.569 18.136 113.774 18.7813C113.994 19.412 114.309 19.962 114.72 20.4313C115.131 20.886 115.637 21.238 116.238 21.4873C116.854 21.7366 117.536 21.8613 118.284 21.8613C119.281 21.8613 120.147 21.656 120.88 21.2453C121.613 20.8346 122.141 20.292 122.464 19.6173L122.024 22.0813V18.2533H125.346V21.6853C124.657 22.8 123.703 23.658 122.486 24.2593C121.283 24.846 119.883 25.1393 118.284 25.1393ZM117.822 18.9573V16.3613H126.666V18.9573H117.822ZM128.954 24.7213V8.66131H132.496V24.7213H128.954ZM127.524 11.2573V8.66131H132.496V11.2573H127.524ZM141.614 25.1393C140.558 25.1393 139.619 24.978 138.798 24.6553C137.976 24.318 137.28 23.8633 136.708 23.2913C136.15 22.7193 135.725 22.0666 135.432 21.3333C135.138 20.5853 134.992 19.8006 134.992 18.9793V18.4733C134.992 17.6373 135.138 16.8453 135.432 16.0973C135.74 15.3346 136.18 14.6673 136.752 14.0953C137.338 13.5233 138.042 13.076 138.864 12.7533C139.685 12.416 140.602 12.2473 141.614 12.2473C142.655 12.2473 143.579 12.416 144.386 12.7533C145.207 13.076 145.904 13.5233 146.476 14.0953C147.048 14.6673 147.488 15.3346 147.796 16.0973C148.104 16.8453 148.258 17.6373 148.258 18.4733V18.9793C148.258 19.8006 148.111 20.5853 147.818 21.3333C147.524 22.0666 147.092 22.7193 146.52 23.2913C145.962 23.8633 145.273 24.318 144.452 24.6553C143.63 24.978 142.684 25.1393 141.614 25.1393ZM141.614 22.1693C142.303 22.1693 142.875 22.0226 143.33 21.7293C143.784 21.436 144.129 21.0253 144.364 20.4973C144.613 19.9693 144.738 19.3826 144.738 18.7373C144.738 18.048 144.613 17.4466 144.364 16.9333C144.114 16.4053 143.755 15.9873 143.286 15.6793C142.831 15.3713 142.274 15.2173 141.614 15.2173C140.968 15.2173 140.411 15.3713 139.942 15.6793C139.472 15.9873 139.113 16.4053 138.864 16.9333C138.629 17.4466 138.512 18.048 138.512 18.7373C138.512 19.3826 138.629 19.9693 138.864 20.4973C139.098 21.0253 139.45 21.436 139.92 21.7293C140.389 22.0226 140.954 22.1693 141.614 22.1693ZM158.128 25.1173C157.146 25.1173 156.28 24.912 155.532 24.5013C154.784 24.076 154.198 23.4673 153.772 22.6753C153.347 21.8833 153.12 20.9153 153.09 19.7713H153.508V24.7213H150.714V8.66131H154.234V16.8233L153.398 17.8793C153.442 16.662 153.67 15.6426 154.08 14.8213C154.506 13.9853 155.085 13.362 155.818 12.9513C156.552 12.526 157.388 12.3133 158.326 12.3133C159.148 12.3133 159.888 12.4673 160.548 12.7753C161.223 13.0686 161.795 13.494 162.264 14.0513C162.734 14.594 163.093 15.2393 163.342 15.9873C163.606 16.7353 163.738 17.5493 163.738 18.4293V18.9133C163.738 19.7933 163.606 20.6073 163.342 21.3553C163.093 22.1033 162.719 22.7633 162.22 23.3353C161.736 23.8926 161.15 24.3326 160.46 24.6553C159.771 24.9633 158.994 25.1173 158.128 25.1173ZM157.204 22.1693C157.806 22.1693 158.326 22.0226 158.766 21.7293C159.221 21.436 159.573 21.0253 159.822 20.4973C160.072 19.9546 160.196 19.346 160.196 18.6713C160.196 17.982 160.072 17.3806 159.822 16.8673C159.573 16.354 159.221 15.958 158.766 15.6793C158.326 15.386 157.806 15.2393 157.204 15.2393C156.676 15.2393 156.178 15.364 155.708 15.6133C155.239 15.8626 154.858 16.222 154.564 16.6913C154.286 17.146 154.146 17.7033 154.146 18.3633V19.1773C154.146 19.808 154.293 20.3506 154.586 20.8053C154.894 21.2453 155.283 21.5826 155.752 21.8173C156.222 22.052 156.706 22.1693 157.204 22.1693ZM173.465 24.7213V21.1573H172.871V17.2853C172.871 16.6693 172.724 16.2073 172.431 15.8993C172.138 15.5913 171.668 15.4373 171.023 15.4373C170.7 15.4373 170.275 15.4446 169.747 15.4593C169.219 15.474 168.676 15.496 168.119 15.5253C167.562 15.5546 167.056 15.584 166.601 15.6133V12.6433C166.938 12.614 167.334 12.5846 167.789 12.5553C168.244 12.526 168.713 12.504 169.197 12.4893C169.681 12.4746 170.136 12.4673 170.561 12.4673C171.793 12.4673 172.827 12.6433 173.663 12.9953C174.514 13.3473 175.159 13.8826 175.599 14.6013C176.039 15.3053 176.259 16.2146 176.259 17.3293V24.7213H173.465ZM169.615 25.0293C168.75 25.0293 167.987 24.8753 167.327 24.5673C166.682 24.2593 166.176 23.8193 165.809 23.2473C165.442 22.6606 165.259 21.964 165.259 21.1573C165.259 20.2773 165.486 19.5586 165.941 19.0013C166.396 18.4293 167.034 18.0113 167.855 17.7473C168.676 17.4686 169.622 17.3293 170.693 17.3293H173.267V19.2873H170.671C170.055 19.2873 169.578 19.4413 169.241 19.7493C168.918 20.0426 168.757 20.446 168.757 20.9593C168.757 21.4433 168.918 21.8393 169.241 22.1473C169.578 22.4406 170.055 22.5873 170.671 22.5873C171.067 22.5873 171.419 22.5213 171.727 22.3893C172.05 22.2426 172.314 22.0006 172.519 21.6633C172.724 21.326 172.842 20.8566 172.871 20.2553L173.707 21.1353C173.634 21.9713 173.428 22.6753 173.091 23.2473C172.768 23.8193 172.314 24.2593 171.727 24.5673C171.155 24.8753 170.451 25.0293 169.615 25.0293ZM179.4 24.7213V8.66131H182.942V24.7213H179.4ZM177.97 11.2573V8.66131H182.942V11.2573H177.97Z"/><path d="M16.6861 5.41505C18.0773 5.39762 18.9443 5.6015 19.738 6.86414C20.4232 7.95426 21.0199 9.09778 21.6655 10.2094L26.5831 18.7238C27.1197 19.6489 30.6532 25.6145 30.7016 25.9792C30.7062 26.013 30.6712 26.042 30.6508 26.0685C30.6308 26.0673 30.6108 26.0661 30.5907 26.0649C30.3 25.8006 29.9653 25.5228 29.6409 25.3291C28.5039 24.6402 27.2953 24.0771 26.0365 23.6495C23.7118 22.8734 21.3054 22.3677 18.865 22.1422C18.329 22.088 17.0188 22.1664 16.7058 22.104L16.687 22.0622C17.2124 21.645 19.8607 20.9521 20.5788 20.8289C20.3291 20.3085 19.9896 19.7602 19.6972 19.2558L18.3795 16.9843C17.9771 16.2999 17.5116 15.3539 17.0337 14.7673C16.8397 15.0729 16.6473 15.437 16.4689 15.7573C15.0951 18.2242 13.5786 20.6457 12.2267 23.1211C12.56 23.1099 12.895 23.0533 13.236 23.0435C15.094 22.99 16.8891 23.1086 18.7256 23.399C19.5974 23.5368 20.3519 23.6159 21.2178 23.8714C21.46 23.9626 22.1632 24.0724 22.47 24.1631C23.0895 24.3461 23.7698 24.5194 24.3792 24.7178C27.116 25.6377 29.722 26.9086 32.132 28.4988C32.3111 28.6193 33.1738 29.1404 33.1611 29.3404L33.0894 29.3528C32.7936 29.1823 31.816 28.9546 31.4513 28.8345C30.7135 28.574 29.9304 28.4934 29.1786 28.3224C28.0533 28.0664 26.9615 27.9401 25.8129 27.8673C25.4708 27.8613 25.0455 27.7451 24.7165 27.7514C24.0999 27.7634 23.4463 27.6313 22.8462 27.6192C20.5421 27.5727 18.2392 27.5908 15.9352 27.6166C15.5938 27.6204 15.2211 27.6839 14.8761 27.7069L12.5308 27.8503C11.5521 27.9186 10.4707 27.936 9.50921 28.0402L4.55651 28.5804C3.69672 28.6813 2.81683 28.8861 1.95279 28.9229C1.84202 28.9276 1.8299 28.9131 1.77698 28.8306C1.90933 28.3794 2.44596 27.5811 2.7034 27.1279C3.60248 25.5405 4.51436 23.9603 5.43886 22.3875L10.7939 13.1032C11.5661 11.7428 12.3488 10.3882 13.1419 9.03978C13.5166 8.3893 13.8829 7.73285 14.2571 7.08166C14.7794 6.17292 15.5929 5.45187 16.6861 5.41505Z" fill="currentColor"/></svg>`;
</script>

<aside id="community-left-sidebar" class="left-sidebar ps-fixed l0">
  <div class="left-sidebar--logo my16">
    <a href="{base}/community/question" class="logo-link" aria-label="Acme Community home">
      {@html logoSvg}
    </a>
  </div>

  <div class="left-sidebar--sticky-container">
    <nav aria-label="Community">
      <!-- Top items -->
      <Navigation label="Top" orientation="vertical" class="nav-links">
        <NavigationItem
          text="Home"
          href="{base}/community/question"
          selected={currentPath === '/community/question'}
          icon={IconHome}
          iconSelected={IconHomeFill}
        />
        <NavigationItem
          text="For You"
          href="#"
          selected={isSelected('/community/for-you')}
          icon={IconInbox}
          iconSelected={IconInboxFill}
        />
      </Navigation>

      <div class="nav-divider"></div>

      <!-- Content -->
      <Navigation label="Content" orientation="vertical" class="nav-links">
        <NavigationTitle title="Content" class="nav-section-title" />
        <NavigationItem
          text="Questions"
          href="#"
          selected={isSelected('/community/questions')}
          icon={IconQuestion}
          iconSelected={IconQuestionFill}
        />
        <NavigationItem
          text="Articles"
          href="#"
          selected={isSelected('/community/articles')}
          icon={IconDocument}
          iconSelected={IconDocument}
        />
        <NavigationItem
          text="Collections"
          href="#"
          selected={isSelected('/community/collections')}
          icon={IconStackBoxes}
          iconSelected={IconStackBoxes}
        />
        <NavigationItem
          text="Bookmarks"
          href="#"
          selected={isSelected('/community/bookmarks')}
          icon={IconBookmark}
          iconSelected={IconBookmarkFill}
        />
        <NavigationItem
          text="Tags"
          href="#"
          selected={isSelected('/community/tags')}
          icon={IconTag}
          iconSelected={IconTagFill}
        />
      </Navigation>

      <div class="nav-divider"></div>

      <!-- People -->
      <Navigation label="People" orientation="vertical" class="nav-links">
        <NavigationTitle title="People" class="nav-section-title" />
        <NavigationItem
          text="Communities"
          href="#"
          selected={isSelected('/community/communities')}
          icon={IconCommunity}
          iconSelected={IconCommunityFill}
        />
        <NavigationItem
          text="Users"
          href="#"
          selected={isSelected('/community/users')}
          icon={IconUser}
          iconSelected={IconUser}
        />
      </Navigation>

      <div class="nav-divider"></div>

      <!-- Manage -->
      <Navigation label="Manage" orientation="vertical" class="nav-links">
        <NavigationTitle title="Manage" class="nav-section-title" />
        <NavigationItem
          text="Dashboard"
          href="#"
          selected={isSelected('/community/dashboard')}
          icon={IconDashboard}
          iconSelected={IconDashboardFill}
        />
        <NavigationItem
          text="Admin settings"
          href="#"
          selected={isSelected('/community/admin')}
          icon={IconSettings}
          iconSelected={IconSettingsFill}
        />
      </Navigation>

    </nav>
  </div>
</aside>

<style>
  .left-sidebar {
    width: 240px;
    top: 0;
    height: 100vh;
    background-color: transparent;
    border-right: 1px solid var(--black-150, #333);
    overflow-y: auto;
    z-index: 1001;
    display: flex;
    flex-direction: column;
  }

  .left-sidebar--logo {
    height: 47px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    flex-shrink: 0;
  }

  .logo-link {
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  :global(#community-left-sidebar .logo-svg) {
    display: block;
    color: #1D4EF3;
  }

  :global(body.theme-dark) :global(#community-left-sidebar .logo-svg) {
    color: var(--purple-500, #7b5cff);
  }

  .left-sidebar--sticky-container {
    padding: 0 8px;
    flex: 1;
    overflow-y: auto;
  }

  .nav-divider {
    height: 1px;
    background-color: var(--black-150, #333);
    margin: 12px 0;
  }

  :global(.community-left-sidebar .s-navigation),
  :global(#community-left-sidebar .s-navigation) {
    gap: 0;
  }

  :global(#community-left-sidebar .s-navigation--item) {
    padding: 10px 8px;
    border-radius: 10px;
    font-size: 14px;
    color: var(--black-600, #fff);
    margin-top: 4px;
  }

  :global(#community-left-sidebar .s-navigation--item .s-navigation--icon) {
    margin-right: 8px;
    color: var(--black-350, #9fa6ad);
  }

  :global(#community-left-sidebar .s-navigation--item:hover) {
    background-color: var(--black-100, #262626);
  }

  :global(body.theme-light) :global(#community-left-sidebar .s-navigation--item:hover) {
    background-color: var(--black-150, #f0efed);
  }

  :global(#community-left-sidebar .s-navigation--item.is-selected) {
    font-weight: bold;
    background-color: var(--black-100, #262626);
    color: var(--black-600, #fff);
  }

  :global(body.theme-light) :global(#community-left-sidebar .s-navigation--item.is-selected) {
    background-color: var(--black-150, #f0efed);
  }

  :global(#community-left-sidebar .s-navigation--item.is-selected .s-navigation--icon) {
    color: var(--black-600, #fff);
  }

  :global(#community-left-sidebar a.s-navigation--item:link),
  :global(#community-left-sidebar a.s-navigation--item:visited) {
    color: var(--black-600, #fff);
  }

  :global(#community-left-sidebar a.s-navigation--item.is-selected:link),
  :global(#community-left-sidebar a.s-navigation--item.is-selected:visited) {
    color: var(--black-600, #fff);
  }

  :global(#community-left-sidebar .nav-section-title) {
    font-size: 12px !important;
    color: var(--black-350, #9fa6ad) !important;
    font-weight: 400 !important;
    text-transform: none !important;
    padding: 4px 8px 8px !important;
    border: none !important;
  }

  .nav-section-title-plain {
    font-size: 12px;
    color: var(--black-400, #d9d4cf);
    font-weight: 400;
    padding: 4px 8px 8px;
  }

  .community-section {
    padding: 0;
  }

  .community-item {
    text-decoration: none;
    border-radius: 10px;
    color: var(--black-600, #fff);
    font-size: 14px;
    transition: background-color 0.15s ease;
    padding: 10px 8px;
    width: 100%;
    margin-top: 4px;
  }

  .community-item:hover {
    background-color: var(--black-100, #262626);
  }

  :global(body.theme-light) .community-item:hover {
    background-color: var(--black-150, #f0efed);
  }

  .community-item:link,
  .community-item:visited {
    color: var(--black-600, #fff);
  }

  .community-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 19px;
    height: 19px;
    flex-shrink: 0;
    border-radius: 3px;
    overflow: hidden;
  }

  .community-text {
    flex: 1;
  }

  .community-external {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  }

  .community-external :global(svg) {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 980px) {
    .left-sidebar {
      display: none;
    }
  }
</style>
