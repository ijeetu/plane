import React, { useEffect, useState } from "react";
import { Intercom, show, hide, onHide } from "@intercom/messenger-js-sdk";
import { observer } from "mobx-react";
// store hooks
import { useInstance } from "@/hooks/store/use-instance";
import { useTransient } from "@/hooks/store/use-transient";
import { useUser } from "@/hooks/store/user";

export type IntercomProviderProps = {
  children: React.ReactNode;
};

const IntercomProvider = observer(function IntercomProvider(props: IntercomProviderProps) {
  const { children } = props;
  // hooks
  const { data: user } = useUser();
  const { config } = useInstance();
  const { isIntercomToggle, toggleIntercom } = useTransient();
  const [isIntercomReady, setIsIntercomReady] = useState(false);

  const canInitializeIntercom = Boolean(user && config?.is_intercom_enabled && config.intercom_app_id);

  useEffect(() => {
    if (!isIntercomReady) return;

    if (isIntercomToggle) show();
    else hide();
  }, [isIntercomReady, isIntercomToggle]);

  useEffect(() => {
    if (!isIntercomReady) return;

    const handleHide = () => toggleIntercom(false);
    onHide(handleHide);
  }, [isIntercomReady, toggleIntercom]);

  useEffect(() => {
    if (canInitializeIntercom) {
      Intercom({
        app_id: config.intercom_app_id || "",
        user_id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        hide_default_launcher: true,
      });
      setIsIntercomReady(true);
    } else {
      setIsIntercomReady(false);
    }
  }, [user, config, toggleIntercom, canInitializeIntercom]);

  return <>{children}</>;
});

export default IntercomProvider;
