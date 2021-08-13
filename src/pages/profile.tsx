import React, { useContext, useCallback, useState, useEffect } from "react";
import GraphContext from "../contexts/graph";
import { updateUserData } from "../services/firebase";
import CatalogueLoader from "../components/catalogue-loader";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { useLookupAddress } from "../hooks/useLookupAddress";
import UserContext from "../contexts/UserProvider";
import { Button } from "../components/common/button";

const Profile: React.FC = () => {
  const { userData, isLoading, refreshUserData } = useContext(GraphContext);
  const currentAddress = useContext(CurrentAddressWrapper);
  const lookupName = useLookupAddress();
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const { signer } = useContext(UserContext);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (username !== "" || bio !== "") {
        updateUserData(currentAddress, username, bio)
          .then(refreshUserData)
          .catch(() => {
            console.warn("could not update user data");
          });
      }
    },
    [username, bio, currentAddress, refreshUserData]
  );

  const handleChangeFormField = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.target.name === "username") {
        setUsername(e.target.value);
      }
      if (e.target.name === "bio") {
        setBio(e.target.value);
      }
    },
    []
  );

  useEffect(() => {
    if (userData) {
      setUsername(userData?.name || "");
      setBio(userData?.bio || "");
    }
  }, [userData]);

  if (!signer) {
    return (
      <div className="center content__message">Please connect your wallet!</div>
    );
  }

  if (isLoading) {
    return <CatalogueLoader />;
  }

  return (
    <div className="flex relative flex-col py-4 min-h-screen w-full">
      <div className="content__row profile-page">
        <div className="profile-header">
          <div className="avatar"></div>
          <div className="username">{userData?.name || "Unnamed"}</div>
          <div className="address">{currentAddress}</div>
          <div className="address">{lookupName}</div>
        </div>
        <div className="profile-body">
          <div className="form">
            <form noValidate autoComplete="off" onSubmit={onSubmit}>
              <div className="form__field">
                <label htmlFor="username">Username</label>
                <input
                  value={username}
                  id="username"
                  name="username"
                  type="text"
                  onChange={handleChangeFormField}
                />
              </div>
              <div className="form__field">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  onChange={handleChangeFormField}
                ></textarea>
              </div>
              <div className="form__button">
                <Button onClick={onSubmit} description="Save" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
