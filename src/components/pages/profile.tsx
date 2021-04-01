import React, {useContext, useCallback} from "react";
import { CurrentAddressContext } from "../../hardhat/SymfoniContext";

const Profile: React.FC = () => {
    const [currentAddress] = useContext(CurrentAddressContext);
    const onSubmit = useCallback(() => {
        console.log('11');
    }, []);
    return (
        <div className="content">
            <div className="content__row profile-page">
                <div className="profile-header">
                    <div className="avatar"></div>
                    <div className="username">Unnamed</div>
                    <div className="address">{currentAddress}</div>
                </div>
                <div className="profile-body">
                    <div className="form">
                        <form
                            noValidate
                            autoComplete="off"
                            onSubmit={onSubmit}
                        >
                            <div className="form__field">
                                <label htmlFor="username">Username</label>
                                <input id="username" name="username" type="text"/>
                            </div>
                            <div className="form__field">
                                <label htmlFor="bio">Bio</label>
                                <textarea id="bio" name="bio"></textarea>                                
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Profile);
