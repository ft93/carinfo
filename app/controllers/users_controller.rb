class UsersController < ApplicationController
    before_action :set_user, only: [:edit, :update, :show, :destroy]

    def index
        @users = User.all
    end

    def show

    end

    def update
        if params[:user][:password].blank?
            params[:user].delete(:password)
            params[:user].delete(:password_confirmation)
        end

        respond_to do |format|
            if @user.update(user_params)
              format.html { redirect_to users_path, notice: 'User was successfully created.' }
            else
              format.html { render :new }
            end
        end

    end

    def destroy
        @user.destroy
        flash[:danger] = "User was successdully destroyed"
	    redirect_to users_path
    end

    private

    def user_params
        params.require(:user).permit(:first_name, :last_name, :email, :username, :password, :password_confirmation, :role)
    end

    def set_user
        @user = User.find(params[:id])
    end
end
