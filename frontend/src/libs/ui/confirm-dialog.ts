import styled from "styled-components";

export const ConfirmHeader = styled.div`
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 1.2rem;
  color: white;
`;

export const ConfirmTargetText = styled.div`
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  color: white;
  width: fit-content;
  margin: 30px auto;
  padding: 5px 10px;
  border-radius: 10px;
`;

export const ConfirmButtonRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;

  & > :first-child {
    margin-left: auto;
  }

  & > :not(:first-child):last-child {
    margin-right: auto;
  }
`;
