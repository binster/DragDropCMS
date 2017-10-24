(function () {
    'use strict';

    //runs after .config but before services are loaded, prevents problems where controllers load for pages that don't exist
    angular.module('cms').run(InitializeCms);

    InitializeCms.$inject = ['$http', '$state', '$location'];

    function InitializeCms($http, $state, $location) {
        $http({
            url: '/api/cms',
            method: 'GET'
        })
            .then(getSuccess, getError);

        function getSuccess(response) {
            const cmsInfo = response.data.item;
            let initialStateName = null;
            let url = $location.url();

            for (let i = 0; i < cmsInfo.pages.length; i++) {
                let page = cmsInfo.pages[i];

                //create controllers for each page
                let cmsPageController = function ($scope) {
                    Object.assign($scope, page.content);
                };

                cmsPageController.$inject = ['$scope'];

                //register routes and states
                $state.router.stateRegistry.register({
                    name: page.name,
                    url: page.url,
                    template: cmsInfo.templates[page.templatePath],
                    controller: cmsPageController
                });

                if (!initialStateName && page.url == url) {
                    initialStateName = page.name;
                }
            }

            // If we're on a URL that is a CMS state, do a $state.go now to poke UI router
            if (initialStateName) {
                $state.go(initialStateName);
            }
        }

        function getError(error) {
            console.error("Error loading CMS content", error);
        }
    }
})();