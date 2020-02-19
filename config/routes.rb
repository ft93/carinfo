Rails.application.routes.draw do
  resources :users
	authenticated :user do 
		root to: 'dashboard#index', as: :authenticated_root
	end
  root to: redirect('/users/sign_in')
  devise_for :users, controllers: {registrations: "registrations"}
  
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
