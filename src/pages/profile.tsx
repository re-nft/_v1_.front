import React, { useContext, useCallback, useState, useEffect } from "react";
import GraphContext from "../contexts/graph";
import { UserData } from "../contexts/graph/types";
import { CurrentAddressContext } from "../hardhat/SymfoniContext";
import { updateUserData } from "../services/firebase";
import CatalogueLoader from "../components/catalogue-loader";
import createCancellablePromise from "../contexts/create-cancellable-promise";

const Profile: React.FC = () => {
  const { getUserData, updateGlobalUserData } = useContext(GraphContext);
  const [currentAddress] = useContext(CurrentAddressContext);
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>();

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (username !== "" || bio !== "") {
        setIsLoading(true);
        updateUserData(currentAddress, username, bio).then(() => {
          updateGlobalUserData();
          setIsLoading(false);
        });
      }
    },
    [username, bio]
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
    setIsLoading(true);

    const dataRequest = createCancellablePromise(getUserData());

    dataRequest.promise.then((userData: UserData | undefined) => {
      if (userData) {
        setUserData(userData);
        setUsername(userData?.name || "");
        setBio(userData?.bio || "");
      }

      setIsLoading(false);
    });

    return dataRequest.cancel;
    /* eslint-disable-next-line */
  }, []);

  if (isLoading) {
    return <CatalogueLoader />;
  }

  return (
    <div className="content">
      <div className="content__row profile-page">
        <div className="profile-header">
          <div className="avatar"></div>
          <div className="username">{userData?.name || "Unnamed"}</div>
          <div className="address">{currentAddress}</div>
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
                <button className="nft__button" onClick={onSubmit}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Profile);
