import React, { useContext, useCallback, useState, useEffect } from "react";
import GraphContext from "../contexts/graph";
import { updateUserData } from "../services/firebase";
import CatalogueLoader from "../components/catalogue-loader";
import { CurrentAddressWrapper } from "../contexts/CurrentAddressWrapper";
import { useLookupAddress } from "../hooks/queries/useLookupAddress";
import UserContext from "../contexts/UserProvider";
import { Button } from "../components/common/button";
import { CatalogueItemRow } from "../components/catalogue-item/catalogue-item-row";
import { TextField } from "../components/common/text-field";
import { TextArea } from "../components/common/textarea";
import { ShortenPopover } from "../components/common/shorten-popover";

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

  const handleChangeFormField = useCallback((e: React.ChangeEvent<unknown>) => {
    // @ts-ignore
    if (e.target.name === "username") {
      // @ts-ignore
      setUsername(e.target.value);
    }
    // @ts-ignore
    if (e.target.name === "bio") {
      // @ts-ignore
      setBio(e.target.value);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setUsername(userData?.name || "");
      setBio(userData?.bio || "");
    }
  }, [userData]);

  if (!signer) {
    return (
      <div className="text-center text-base text-white font-display py-32 leading-tight">
        Please connect your wallet!
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto">
        <CatalogueLoader />
      </div>
    );
  }

  return (
    <div className="flex relative flex-col py-4 min-h-screen w-full">
      <div className="mx-auto py-4 px-6 w-80 text-xl flex flex-col space-y-2">
        <div className="text-white">
          <CatalogueItemRow
            text="Username"
            value={userData?.name || "Unnamed"}
          />
          <CatalogueItemRow
            text="Address"
            value={<ShortenPopover longString={currentAddress} />}
          />
          <CatalogueItemRow
            text="Reverse address"
            value={<ShortenPopover longString={lookupName || "none"} />}
          />
        </div>

        <form
          noValidate
          autoComplete="off"
          onSubmit={onSubmit}
          className="flex flex-col space-y-2 p-4"
        >
          <TextField
            required
            label="Username"
            id="username"
            name="username"
            value={userData?.name || ""}
            onChange={handleChangeFormField}
            onBlur={handleChangeFormField}
          />
          <TextArea
            required
            label="Bio"
            id="bio"
            name="bio"
            value={bio}
            onChange={handleChangeFormField}
            onBlur={handleChangeFormField}
            rows={6}
          />
          <div className="flex justify-center items-center p-4">
            <Button onClick={onSubmit} description="Save" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
