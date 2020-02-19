class RegistrationsController < Devise::RegistrationsController
    before_action :authenticate_user!, :redirect_unless_admin, only: [:new, :update]
    skip_before_action :require_no_authentication
  
     private
  
     def redirect_unless_admin
       unless current_user.try(:admin?)
         flash[:error] = "Only Admin can register"
         redirect_to root_path
       end
     end
  
     def sign_up(resource_name, resource)
       true
     end
  
     def sign_up_params
      params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation, :username, :role)
     end
  
     def account_update_params
      params.require(:user).permit(:first_name, :last_name, :email, :password, :password_confirmation, :username, :role,  :current_password)
  
     end
  
  end