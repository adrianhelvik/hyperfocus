import { Link } from "react-router-dom";
import styled from "styled-components";
import * as theme from "../../theme";

export const Title = styled.h1`
    text-align: center;
    font-weight: 300;
    font-size: 70px;
    line-height: 110px;
    color: #333;
    pointer-events: none;
`;

export const Section = styled.section`
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    min-height: calc(100vh - 75px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    position: relative;
    flex-direction: column;
`;

export const Particles = styled.div`
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
`;

export const Register = styled(Link)`
    font-size: 30px;
    background-color: ${theme.ui1};
    border: 4px solid ${theme.ui1};
    color: white;
    border: 0;
    border-radius: 4px;
    padding: 10px 20px;
    display: block;
    margin: 0 auto;
    pointer-events: auto;
    width: fit-content;
    text-align: center;
    text-decoration: none;
`;

export const Content = styled.div`
    background: radial-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
    padding: 60px;
    padding-bottom: 120px;
`;

export const LoginWrapper = styled.div`
    text-align: center;
    margin-top: 20px;
    font-size: 20px;
`;

export const Login = styled(Link)`
    color: ${theme.ui1};
    pointer-events: auto;
`;
